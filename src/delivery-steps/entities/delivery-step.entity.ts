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
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity';
import { Location } from 'src/locations/entities/location.entity';

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

  @ManyToOne(() => User, (user) => user.deliverySteps, { nullable: true, eager: true })
  receivedBy?: User;

  @ManyToOne(() => DeliveryAd, (deliveryAd) => deliveryAd.deliverySteps, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  deliveryAd: DeliveryAd;

  @Column()
  stepNumber: number;

  @Column()
  price: number;

  @Column({
    type: 'enum',
    enum: DeliveryStepStatus,
    default: DeliveryStepStatus.PENDING,
  })
  status: DeliveryStepStatus;

  @ManyToOne(() => Location, (location) => location.departureSteps, { eager: true })
  departureLocation: Location;

  @ManyToOne(() => Location, (location) => location.arrivalSteps, { eager: true })
  arrivalLocation: Location;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
