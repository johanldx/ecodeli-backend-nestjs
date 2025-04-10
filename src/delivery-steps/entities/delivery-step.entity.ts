import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/user.entity';
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity';

// Enum DeliveryStepStatus directement dans ce fichier
export enum DeliveryStepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('delivery_steps')
export class DeliveryStep {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.deliverySteps)
  receivedBy: User;

  @ManyToOne(() => DeliveryAd, (deliveryAd) => deliveryAd.deliverySteps)
  deliveryAd: DeliveryAd;

  @Column()
  stepNumber: number;

  @Column()
  price: number;

  @Column({ type: 'enum', enum: DeliveryStepStatus, default: DeliveryStepStatus.PENDING })
  status: DeliveryStepStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
