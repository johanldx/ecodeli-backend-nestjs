import { Test, TestingModule } from '@nestjs/testing';
import { PersonalServiceTypeAuthorizationsController } from './personal-service-type-authorizations.controller';

describe('PersonalServiceTypeAuthorizationsController', () => {
  let controller: PersonalServiceTypeAuthorizationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalServiceTypeAuthorizationsController],
    }).compile();

    controller = module.get<PersonalServiceTypeAuthorizationsController>(
      PersonalServiceTypeAuthorizationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
