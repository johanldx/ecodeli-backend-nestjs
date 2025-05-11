import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Client } from 'src/clients/client.entity';
import { Location } from 'src/locations/entities/location.entity';
import { DeliveryStep } from 'src/delivery-steps/entities/delivery-step.entity';
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity';
import { ReleaseCartAd } from 'src/release-cart-ads/entities/release-cart-ad.entity';
import { ShoppingAd } from 'src/shopping-ads/entities/shopping-ads.entity';
import { PersonalServiceAd } from '../personal-services-ads/personal-service-ad.entity';

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
  deliverySteps: DeliveryStep[];

  @OneToMany(() => DeliveryAd, (deliveryAd) => deliveryAd.postedBy)
  deliveryAds: DeliveryAd[];

  @OneToMany(() => ReleaseCartAd, (releaseCartAd) => releaseCartAd.postedBy)
  releaseCartAds: ReleaseCartAd[];

  @OneToMany(() => ShoppingAd, (shoppingAd) => shoppingAd.postedBy) // Added relationship with ShoppingAd
  shoppingAds: ShoppingAd[]; // Relation with ShoppingAd

  @OneToMany(() => PersonalServiceAd, (ad) => ad.postedBy)
  personalServiceAds: PersonalServiceAd[];
}
