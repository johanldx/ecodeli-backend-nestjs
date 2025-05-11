import { Test, TestingModule } from '@nestjs/testing';
import { PersonalServiceTypesController } from './personal-service-types.controller';

describe('PersonalServiceTypesController', () => {
  let controller: PersonalServiceTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalServiceTypesController],
    }).compile();

    controller = module.get<PersonalServiceTypesController>(
      PersonalServiceTypesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
