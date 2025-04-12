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
import { ApiProperty } from '@nestjs/swagger';

@Entity('locations')
export class Location {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;
  @ManyToOne(() => User, user => user.locations, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  address: string;

  @ApiProperty()
  @Column()
  cp: string;

  @ApiProperty()
  @Column()
  city: string;

  @ApiProperty()
  @Column()
  country: string;

  @ApiProperty({ default: false })
  @Column({ default: false })
  public: boolean;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'double precision', nullable: true })
  price: number;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'edited_at' })
  editedAt: Date;
}
