import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';

export enum AdTypes {
  ServiceProvisions = 'ServiceProvisions',
  DeliverySteps = 'DeliverySteps',
  ReleaseCartAds = 'ReleaseCartAds',
  ShoppingAds = 'ShoppingAds',
}

export enum ConversationStatus {
  Pending = 'pending',
  Ongoing = 'ongoing',
  Completed = 'completed',
  Closed = 'closed',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AdTypes, name: 'ad_type' })
  adType: AdTypes;

  @Column({ name: 'ad_id' })
  adId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_from' })
  userFrom: User;

  @Column({ type: 'enum', enum: ConversationStatus })
  status: ConversationStatus;

  @Column('double')
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'edited_at' })
  editedAt: Date;
}
