import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OneToMany } from 'typeorm';
import { PersonalServiceTypeAuthorization } from '../personal-service-type-authorizations/personal-service-type-authorization.entity';
import { PersonalServiceAd } from '../personal-services-ads/personal-service-ad.entity';
import { ProviderSchedule } from '../provider-schedules/provider-schedule.entity';

@Entity('personal_service_types')
export class PersonalServiceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => PersonalServiceTypeAuthorization,
    (auth) => auth.personalServiceType,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  authorizations: PersonalServiceTypeAuthorization[];

  @OneToMany(() => ProviderSchedule, (schedule) => schedule.personalServiceType)
  schedules: ProviderSchedule[];

  @OneToMany(() => PersonalServiceAd, (ad) => ad.type)
  ads: PersonalServiceAd[];

  @Column()
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'edited_at' })
  editedAt: Date;
}
