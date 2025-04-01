import { Test, TestingModule } from '@nestjs/testing';
import { TradersController } from './traders.controller';

describe('TradersController', () => {
  let controller: TradersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradersController],
    }).compile();

    controller = module.get<TradersController>(TradersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
