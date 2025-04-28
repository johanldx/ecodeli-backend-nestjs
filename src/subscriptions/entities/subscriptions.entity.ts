import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPayment } from 'src/subscription-payments/entities/subscription-payment.entity'; // Import pour la relation avec SubscriptionPayment

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier for the subscription.' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The name of the subscription plan.' })
  name: string;

  @Column()
  @ApiProperty({
    description: 'A detailed description of the subscription plan.',
  })
  description: string;

  @Column()
  @ApiProperty({ description: 'The price of the subscription.' })
  price: number;

  @Column()
  @ApiProperty({
    description:
      'The Stripe payment system ID associated with the subscription.',
  })
  stripe_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Timestamp when the subscription was created.' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({
    description: 'Timestamp when the subscription was last updated.',
  })
  updated_at: Date;

  // Relation one-to-many avec SubscriptionPayment
  @OneToMany(() => SubscriptionPayment, (payment) => payment.subscription)
  @ApiProperty({
    description: 'The payments associated with the subscription.',
  })
  payments: SubscriptionPayment[];
}
