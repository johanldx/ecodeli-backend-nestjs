import { Test, TestingModule } from '@nestjs/testing';
import { ReleaseCartAdsService } from './release-cart-ads.service';

describe('ReleaseCartAdsService', () => {
  let service: ReleaseCartAdsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReleaseCartAdsService],
    }).compile();

    service = module.get<ReleaseCartAdsService>(ReleaseCartAdsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
