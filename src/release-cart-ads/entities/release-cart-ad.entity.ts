import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/user.entity';
import { Location } from 'src/locations/entities/location.entity';

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

@Entity('release_cart_ads')
export class ReleaseCartAd {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier for the release cart ad.',
  })
  id: number;

  @ManyToOne(() => User, (user) => user.releaseCartAds)
  @ApiProperty({ description: 'The user who posted the ad.' })
  postedBy: User;

  @ManyToOne(() => User, (user) => user.releaseCartAds)
  @ApiProperty({ description: 'The user who received the ad.' })
  receivedBy: User;

  @Column()
  @ApiProperty({ description: 'The title of the release cart ad.' })
  title: string;

  @Column('text')
  @ApiProperty({ description: 'A description of the release cart ad.' })
  description: string;

  @Column()
  @ApiProperty({ description: 'The email of the client.' })
  clientEmail: string;

  @Column('json')
  @ApiProperty({ description: 'The URLs of images associated with the ad.' })
  imageUrls: string[];

  @Column({ type: 'enum', enum: AdStatus, default: AdStatus.PENDING })
  @ApiProperty({ description: 'The current status of the release cart ad.' })
  status: AdStatus;

  @Column()
  @ApiProperty({ description: 'The reference code for the release cart ad.' })
  reference: string;

  @ManyToOne(() => Location)
  @ApiProperty({ description: 'The departure location of the release cart.' })
  departureLocation: Location;

  @ManyToOne(() => Location)
  @ApiProperty({ description: 'The arrival location of the release cart.' })
  arrivalLocation: Location;

  @Column({ type: 'enum', enum: PackageSize })
  @ApiProperty({ description: 'The size of the package in the release cart.' })
  packageSize: PackageSize;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({
    description: 'Timestamp when the release cart ad was created.',
  })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({
    description: 'Timestamp when the release cart ad was last updated.',
  })
  updatedAt: Date;
}
