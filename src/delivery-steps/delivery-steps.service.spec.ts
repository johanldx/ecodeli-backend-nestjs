import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryStepsService } from './delivery-steps.service';

describe('DeliveryStepsService', () => {
  let service: DeliveryStepsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryStepsService],
    }).compile();

    service = module.get<DeliveryStepsService>(DeliveryStepsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
