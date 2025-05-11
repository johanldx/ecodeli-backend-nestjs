import { Test, TestingModule } from '@nestjs/testing';
import { PersonalServicesAdsService } from './personal-services-ads.service';

describe('PersonalServicesAdsService', () => {
  let service: PersonalServicesAdsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonalServicesAdsService],
    }).compile();

    service = module.get<PersonalServicesAdsService>(
      PersonalServicesAdsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
