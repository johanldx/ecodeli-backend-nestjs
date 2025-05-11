import { Test, TestingModule } from '@nestjs/testing';
import { ProviderSchedulesController } from './provider-schedules.controller';

describe('ProviderSchedulesController', () => {
  let controller: ProviderSchedulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderSchedulesController],
    }).compile();

    controller = module.get<ProviderSchedulesController>(
      ProviderSchedulesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
