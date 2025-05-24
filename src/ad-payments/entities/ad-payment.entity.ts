import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus, PaymentTypes } from './payment.enums';
import { User } from 'src/users/user.entity';

@Entity('ad_payments')
export class AdPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('float')
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentTypes,
  })
  payment_type: PaymentTypes;

  @Column()
  reference_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  edited_at: Date;
}
