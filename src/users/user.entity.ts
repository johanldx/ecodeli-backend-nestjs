import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Client } from 'src/clients/client.entity';
import { Location } from 'src/locations/entities/location.entity';
import { DeliveryStep } from 'src/delivery-steps/entities/delivery-step.entity'; // Import pour la relation avec DeliveryStep
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity'; // Import pour la relation avec DeliveryAd

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  administrator: boolean;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // Relations

  @OneToOne(() => Client, (client) => client.user, { onDelete: 'CASCADE' })
  clients: Client[];

  @OneToMany(() => Location, (location) => location.user)
  locations: Location[];

  @OneToMany(() => DeliveryStep, (deliveryStep) => deliveryStep.receivedBy)
  deliverySteps: DeliveryStep[]; // Relation avec DeliveryStep

  @OneToMany(() => DeliveryAd, (deliveryAd) => deliveryAd.postedBy)
  deliveryAds: DeliveryAd[]; // Relation avec DeliveryAd
}
