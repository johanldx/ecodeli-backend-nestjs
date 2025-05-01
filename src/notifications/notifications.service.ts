import {
    Injectable,
    NotFoundException,
    ForbiddenException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Notification } from './entities/notification.entity';
  import { CreateNotificationDto } from './dto/create-notification.dto';
  import { UpdateNotificationDto } from './dto/update-notification.dto';
  import { User } from 'src/users/user.entity';
import { MessagesGateway } from 'src/messages/messages.gateway';
  
  @Injectable()
  export class NotificationsService {
    constructor(
      @InjectRepository(Notification)
      private readonly repo: Repository<Notification>,
      private readonly messagesGateway: MessagesGateway,
    ) {}
  
    async create(dto: CreateNotificationDto, user: User): Promise<Notification> {
        if (!user.administrator && user.id !== dto.receiverId) {
          throw new ForbiddenException();
        }
    
        const notif = this.repo.create({
          content: dto.content,
          receiver: { id: dto.receiverId } as any,
          conversation: { id: dto.conversationId } as any,
        });
        const saved = await this.repo.save(notif);
    
        // → PUSH via WS dans la room de la conversation
        this.messagesGateway.server
          .to(`conversation_${dto.conversationId}`)
          .emit('newMessage', {
            id: saved.id,                             // ou un autre identifiant
            role: 'system',                           // côté client, tu traiterais ça en notification
            content: saved.content,
            senderName: 'Notification automatique',
            conversationId: dto.conversationId,
            createdAt: saved.createdAt,
          });
    
        return saved;
      }
  
    async findAll(user: User): Promise<Notification[]> {
      if (user.administrator) {
        return this.repo.find({ order: { createdAt: 'DESC' } });
      }
      return this.repo.find({
        where: { receiver: { id: user.id } },
        order: { createdAt: 'DESC' },
      });
    }
  
    async findOne(id: number, user: User): Promise<Notification> {
      const notif = await this.repo.findOne({ where: { id } });
      if (!notif) throw new NotFoundException('Notification introuvable');
      if (!user.administrator && notif.receiver.id !== user.id) {
        throw new ForbiddenException();
      }
      return notif;
    }
  
    async update(
      id: number,
      dto: UpdateNotificationDto,
      user: User,
    ): Promise<Notification> {
      const notif = await this.findOne(id, user);
      Object.assign(notif, dto);
      return this.repo.save(notif);
    }
  
    async remove(id: number, user: User): Promise<void> {
      const notif = await this.findOne(id, user);
      await this.repo.delete(notif.id);
    }
  }
  