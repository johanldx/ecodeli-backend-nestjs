import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryPersonsService } from './delivery-persons.service';

describe('DeliveryPersonsService', () => {
  let service: DeliveryPersonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryPersonsService],
    }).compile();

    service = module.get<DeliveryPersonsService>(DeliveryPersonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
