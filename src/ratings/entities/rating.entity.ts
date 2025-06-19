import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @Column({ name: 'provider_id' })
  providerId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'rater_id' })
  rater: User;

  @Column({ name: 'rater_id' })
  raterId: number;

  @ManyToOne(() => Conversation, { eager: true })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'conversation_id' })
  conversationId: number;

  @Column({ type: 'int', name: 'rating', nullable: true })
  rating: number | null; // 1-5 étoiles, null tant que pas noté

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  token: string; // Token unique pour l'email

  @Column({ type: 'boolean', default: false })
  isUsed: boolean; // Pour éviter les votes multiples

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 