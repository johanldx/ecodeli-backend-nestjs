import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Provider } from '../providers/provider.entity';
import { PersonalServiceType } from '../personal-service-types/personal-service-type.entity';

export enum ProviderScheduleStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
}

@Entity('provider_schedules')
export class ProviderSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Provider, (provider) => provider.schedules)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => PersonalServiceType, (pst) => pst.schedules)
  @JoinColumn({ name: 'personal_service_type_id' })
  personalServiceType: PersonalServiceType;

  @Column({ type: 'datetime', name: 'start_time' })
  startTime: Date;

  @Column({ type: 'datetime', name: 'end_time' })
  endTime: Date;

  @Column({ type: 'enum', enum: ProviderScheduleStatus })
  status: ProviderScheduleStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'edited_at' })
  editedAt: Date;
}
