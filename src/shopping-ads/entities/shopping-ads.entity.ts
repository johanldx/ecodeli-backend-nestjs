import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

@Entity('shopping_ads')
export class ShoppingAd {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier for the shopping ad.' })
  id: number;

  @ManyToOne(() => User, (user) => user.shoppingAds)
  @ApiProperty({ description: 'The user who posted the shopping ad.' })
  postedBy: User;

  @ManyToOne(() => User, (user) => user.shoppingAds)
  @ApiProperty({ description: 'The user who received the shopping ad.' })
  receivedBy: User;

  @Column()
  @ApiProperty({ description: 'The title of the shopping ad.' })
  title: string;

  @Column('text')
  @ApiProperty({ description: 'A description of the shopping ad.' })
  description: string;

  @Column('json')
  @ApiProperty({ description: 'Image URLs related to the shopping ad.' })
  imageUrls: string[];

  @Column({ type: 'enum', enum: AdStatus, default: AdStatus.PENDING })
  @ApiProperty({ description: 'The status of the shopping ad.' })
  status: AdStatus;

  @ManyToOne(() => Location)
  @ApiProperty({ description: 'The departure location for the shopping ad.' })
  departureLocation: Location;

  @ManyToOne(() => Location)
  @ApiProperty({ description: 'The arrival location for the shopping ad.' })
  arrivalLocation: Location;

  @Column({ type: 'enum', enum: PackageSize })
  @ApiProperty({ description: 'The package size for the shopping ad.' })
  packageSize: PackageSize;

  @Column('json')
  @ApiProperty({ description: 'The shopping list associated with the shopping ad.' })
  shoppingList: string[];

  @Column('double')
  @ApiProperty({ description: 'The price for the shopping ad.' })
  price: number;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Timestamp when the shopping ad was created.' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Timestamp when the shopping ad was last updated.' })
  updatedAt: Date;
}
