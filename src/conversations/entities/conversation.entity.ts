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
import { ProviderSchedule } from 'src/provider-schedules/provider-schedule.entity';

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

  @ManyToOne(() => ProviderSchedule, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'providerScheduleId' })
  providerSchedule?: ProviderSchedule;

  @Column({ nullable: true })
  providerScheduleId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'edited_at' })
  editedAt: Date;
}
