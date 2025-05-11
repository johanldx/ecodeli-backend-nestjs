import { Test, TestingModule } from '@nestjs/testing';
import { PersonalServiceTypeAuthorizationsService } from './personal-service-type-authorizations.service';

describe('PersonalServiceTypeAuthorizationsService', () => {
  let service: PersonalServiceTypeAuthorizationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonalServiceTypeAuthorizationsService],
    }).compile();

    service = module.get<PersonalServiceTypeAuthorizationsService>(
      PersonalServiceTypeAuthorizationsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
