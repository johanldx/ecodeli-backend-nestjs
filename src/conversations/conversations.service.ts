import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly repo: Repository<Conversation>,
  ) {}

  async create(dto: CreateConversationDto): Promise<Conversation> {
    const conv = this.repo.create({
      ...dto,
      userFrom: { id: dto.userFrom },
    });
    return this.repo.save(conv);
  }

  async findAll(userId: number): Promise<Conversation[]> {
    return this.repo.find({ where: { userFrom: { id: userId } } });
  }

  async findOne(id: number, userId: number): Promise<Conversation> {
    const conv = await this.repo.findOne({ where: { id } });
    if (!conv) throw new NotFoundException('Conversation introuvable');
    if (conv.userFrom.id !== userId) throw new ForbiddenException();
    return conv;
  }

  async update(
    id: number,
    dto: UpdateConversationDto,
    userId: number,
  ): Promise<Conversation> {
    const conv = await this.findOne(id, userId);
    Object.assign(conv, dto);
    return this.repo.save(conv);
  }

  async remove(id: number, userId: number): Promise<void> {
    const conv = await this.findOne(id, userId);
    await this.repo.delete(conv.id);
  }
}
