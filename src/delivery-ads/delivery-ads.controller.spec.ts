import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryAdsController } from './delivery-ads.controller';
import { DeliveryAdsService } from './delivery-ads.service';

describe('DeliveryAdsController', () => {
  let controller: DeliveryAdsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryAdsController],
      providers: [DeliveryAdsService],
    }).compile();

    controller = module.get<DeliveryAdsController>(DeliveryAdsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
