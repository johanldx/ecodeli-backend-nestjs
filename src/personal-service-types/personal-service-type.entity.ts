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

@Entity('personal_service_types')
export class PersonalServiceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => PersonalServiceTypeAuthorization,
    (auth) => auth.personalServiceType,
  )
  authorizations: PersonalServiceTypeAuthorization[];

  @OneToMany(() => PersonalServiceAd, (ad) => ad.type)
  ads: PersonalServiceAd[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'edited_at' })
  editedAt: Date;
}
