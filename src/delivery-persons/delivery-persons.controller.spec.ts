import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryPersonsController } from './delivery-persons.controller';

describe('DeliveryPersonsController', () => {
  let controller: DeliveryPersonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryPersonsController],
    }).compile();

    controller = module.get<DeliveryPersonsController>(
      DeliveryPersonsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
