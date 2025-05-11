import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { PersonalServiceType } from '../personal-service-types/personal-service-type.entity';

export enum AdStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('personal_service_ads')
export class PersonalServiceAd {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.personalServiceAds, { eager: true })
  @JoinColumn({ name: 'posted_by' })
  postedBy: User;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'json', name: 'image_urls' })
  imageUrls: string[];

  @Column({ type: 'enum', enum: AdStatus, default: AdStatus.PENDING })
  status: AdStatus;

  @ManyToOne(() => PersonalServiceType, (pst) => pst.ads, { eager: true })
  @JoinColumn({ name: 'type_id' })
  type: PersonalServiceType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'edited_at' })
  editedAt: Date;
}
