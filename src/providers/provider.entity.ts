import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { OneToMany } from 'typeorm';
import { PersonalServiceTypeAuthorization } from '../personal-service-type-authorizations/personal-service-type-authorization.entity';

export enum ValidationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({
    type: 'enum',
    enum: ValidationStatus,
    default: ValidationStatus.PENDING,
  })
  status: ValidationStatus;

  @Column()
  identity_card_document: string;

  @Column()
  proof_of_business_document: string;

  @Column({ type: 'json', nullable: true })
  certification_documents: string[];

  @Column()
  bank_account: string;

  @Column()
  name: string;

  @OneToMany(() => PersonalServiceTypeAuthorization, (auth) => auth.provider)
  personalServiceTypeAuthorizations: PersonalServiceTypeAuthorization[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  edited_at: Date;
}
