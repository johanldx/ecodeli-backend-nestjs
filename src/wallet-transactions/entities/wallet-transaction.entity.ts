export class WalletTransactionEntity {}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { AdPayment } from '../../ad-payments/entities/ad-payment.entity';
import { WalletTransactionTypes } from './wallet-transaction-types.enum';

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wallet, { eager: true })
  @JoinColumn({ name: 'walet_id' })
  wallet: Wallet;

  @Column({
    type: 'enum',
    enum: WalletTransactionTypes,
  })
  type: WalletTransactionTypes;

  @Column('float')
  amount: number;

  @ManyToOne(() => AdPayment, { nullable: true })
  @JoinColumn({ name: 'related_payment_id' })
  related_payment?: AdPayment;

  @Column({ default: false })
  is_available: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  edited_at: Date;
}
