import { Test, TestingModule } from '@nestjs/testing';
import { PersonalServicesAdsController } from './personal-services-ads.controller';

describe('PersonalServicesAdsController', () => {
  let controller: PersonalServicesAdsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalServicesAdsController],
    }).compile();

    controller = module.get<PersonalServicesAdsController>(
      PersonalServicesAdsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
