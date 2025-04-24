import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier for the route.' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The delivery person assigned to the route.' })
  delivery_person_id: number;

  @Column()
  @ApiProperty({ description: 'The departure location ID.' })
  departure_location: number;

  @Column()
  @ApiProperty({ description: 'The arrival location ID.' })
  arrival_location: number;

  @Column()
  @ApiProperty({ description: 'The day the route is scheduled for.' })
  day: Date;

  @Column({ type: 'timestamp' })
  @ApiProperty({ description: 'Timestamp when the route was created.' })
  created_at: Date;

  @Column({ type: 'timestamp' })
  @ApiProperty({ description: 'Timestamp when the route was last updated.' })
  updated_at: Date;
}
