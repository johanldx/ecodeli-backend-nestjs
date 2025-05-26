import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Location } from 'src/locations/entities/location.entity';
import { DeliveryPerson } from 'src/delivery-persons/delivery-person.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier for the route.' })
  id: number;

  @ManyToOne(() => DeliveryPerson, { eager: true })
  @JoinColumn({ name: 'delivery_person_id' })
  deliveryPerson: DeliveryPerson;

  @ManyToOne(() => Location, { eager: true })
  @JoinColumn({ name: 'departure_location' })
  departureLocationEntity: Location;

  @ManyToOne(() => Location, { eager: true })
  @JoinColumn({ name: 'arrival_location' })
  arrivalLocationEntity: Location;

  @Column()
  @ApiProperty({ description: 'The day the route is scheduled for.' })
  day: Date;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Timestamp when the route was created.' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Timestamp when the route was last updated.' })
  updated_at: Date;
}
