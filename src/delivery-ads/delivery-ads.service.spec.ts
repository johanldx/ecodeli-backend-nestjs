import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryAdsService } from './delivery-ads.service';

describe('DeliveryAdsService', () => {
  let service: DeliveryAdsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryAdsService],
    }).compile();

    service = module.get<DeliveryAdsService>(DeliveryAdsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
