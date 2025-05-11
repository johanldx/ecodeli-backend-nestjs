import { Test, TestingModule } from '@nestjs/testing';
import { ProviderSchedulesService } from './provider-schedules.service';

describe('ProviderSchedulesService', () => {
  let service: ProviderSchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProviderSchedulesService],
    }).compile();

    service = module.get<ProviderSchedulesService>(ProviderSchedulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
