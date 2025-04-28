import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Location } from 'src/locations/entities/location.entity';
import { DeliveryStep } from 'src/delivery-steps/entities/delivery-step.entity';

export enum AdStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PackageSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  XL = 'XL',
  XXL = 'XXL',
}

@Entity('delivery_ads')
export class DeliveryAd {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.deliveryAds)
  postedBy: User;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  imageUrls: string[];

  @Column({ type: 'enum', enum: AdStatus, default: AdStatus.PENDING })
  status: AdStatus;

  @Column()
  reference: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => DeliveryStep, (step) => step.deliveryAd)
  deliverySteps: DeliveryStep[];

  @Column({ type: 'enum', enum: PackageSize, default: PackageSize.M })
  packageSize: PackageSize;
}
