import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingAdsService } from './shopping-ads.service';

describe('ShoppingAdsService', () => {
  let service: ShoppingAdsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShoppingAdsService],
    }).compile();

    service = module.get<ShoppingAdsService>(ShoppingAdsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
