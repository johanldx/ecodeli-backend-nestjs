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

  async create(dto: CreateMessageDto, userId?: number): Promise<Message> {
    const msg = this.repo.create({
      content: dto.content,
      conversation: { id: dto.conversationId } as any,
      sender: userId ? ({ id: userId } as any) : undefined,
    });
    return this.repo.save(msg);
  }

  async findByConversation(
    conversationId: number,
    userId: number,
  ): Promise<Message[]> {
    return this.repo.find({
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'ASC' },
    });
  }
}
