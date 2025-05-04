import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) {}

  async create(dto: CreateMessageDto, userId: number): Promise<Message> {
    // on vérifie que la conversation existe et appartient à l'utilisateur ou c'est leur conv
    const msg = this.repo.create({
      content: dto.content,
      conversation: { id: dto.conversationId } as any,
      sender: { id: userId } as any,
    });
    return this.repo.save(msg);
  }

  async findByConversation(
    conversationId: number,
    userId: number,
  ): Promise<Message[]> {
    // TODO : vérifier que userId fait partie de la conversation
    return this.repo.find({
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'ASC' },
    });
  }
}
