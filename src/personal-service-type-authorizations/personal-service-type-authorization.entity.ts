import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Provider } from '../providers/provider.entity';
import { PersonalServiceType } from '../personal-service-types/personal-service-type.entity';

@Entity('personal_service_type_authorizations')
export class PersonalServiceTypeAuthorization {
  @PrimaryColumn({ name: 'provider_id', type: 'int' })
  providerId: number;

  @PrimaryColumn({ name: 'personal_service_type_id', type: 'int' })
  personalServiceTypeId: number;

  @ManyToOne(
    () => Provider,
    (provider) => provider.personalServiceTypeAuthorizations,
  )
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => PersonalServiceType, (pst) => pst.authorizations)
  @JoinColumn({ name: 'personal_service_type_id' })
  personalServiceType: PersonalServiceType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'edited_at' })
  editedAt: Date;
}
