import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Subscription } from 'src/subscriptions/entities/subscriptions.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('subscription_payments')
export class SubscriptionPayment {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier for the payment.' })
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ description: 'The amount of the subscription payment.' })
  amount: number;

  @Column()
  @ApiProperty({ description: 'The Stripe payment ID associated with the payment.' })
  stripe_payment_id: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  @ApiProperty({ description: 'The current status of the payment.' })
  status: PaymentStatus;

  @ManyToOne(() => Subscription, (subscription) => subscription.payments)
  @ApiProperty({ description: 'The subscription that this payment is associated with.' })
  subscription: Subscription;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Timestamp when the payment was created.' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Timestamp when the payment was last updated.' })
  updatedAt: Date;
}
