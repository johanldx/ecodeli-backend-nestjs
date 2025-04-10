import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryStepsController } from './delivery-steps.controller';
import { DeliveryStepsService } from './delivery-steps.service';

describe('DeliveryStepsController', () => {
  let controller: DeliveryStepsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryStepsController],
      providers: [DeliveryStepsService],
    }).compile();

    controller = module.get<DeliveryStepsController>(DeliveryStepsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
