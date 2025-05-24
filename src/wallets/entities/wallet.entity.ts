import { User } from 'src/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('float', { default: 0 })
  amout_available: number;

  @Column('float', { default: 0 })
  amout_pending: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  edited_at: Date;
}
