import { Test, TestingModule } from '@nestjs/testing';
import { PersonalServiceTypesService } from './personal-service-types.service';

describe('PersonalServiceTypesService', () => {
  let service: PersonalServiceTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonalServiceTypesService],
    }).compile();

    service = module.get<PersonalServiceTypesService>(
      PersonalServiceTypesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
