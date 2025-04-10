import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ReleaseCartAdsService } from './release-cart-ads.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReleaseCartAd } from './entities/release-cart-ad.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { CreateReleaseCartAdDto } from './dto/create-release-cart-ad.dto';
import { UpdateReleaseCartAdDto } from './dto/update-release-cart-ad.dto';
import { AdStatus } from '../delivery-ads/entities/delivery-ads.entity';

describe('ReleaseCartAdsService', () => {
  let service: ReleaseCartAdsService;
  let repo: Repository<ReleaseCartAd>;

  const mockReleaseCartAdRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockResolvedValue(true),
    findOne: jest.fn().mockResolvedValue({ id: 1, ...new CreateReleaseCartAdDto() }),
    findOneOrFail: jest.fn(),
    delete: jest.fn().mockResolvedValue(true),
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleaseCartAdsService,
        {
          provide: getRepositoryToken(ReleaseCartAd),
          useValue: mockReleaseCartAdRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<ReleaseCartAdsService>(ReleaseCartAdsService);
    repo = module.get<Repository<ReleaseCartAd>>(getRepositoryToken(ReleaseCartAd));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a release cart ad', async () => {
    const dto = new CreateReleaseCartAdDto();
    dto.title = 'Test Ad';
    const result = await service.create(dto, { id: 1 } as User);
    expect(result).toBe(true);
    expect(mockReleaseCartAdRepository.create).toHaveBeenCalled();
    expect(mockReleaseCartAdRepository.save).toHaveBeenCalled();
  });

  it('should find all release cart ads for a user', async () => {
    const ads = await service.findAll({ id: 1 } as User, {});
    expect(ads).toEqual([]);
    expect(mockReleaseCartAdRepository.getMany).toHaveBeenCalled();
  });

  it('should find one release cart ad by ID', async () => {
    const ad = await service.findOne(1, { id: 1 } as User);
    expect(ad).toHaveProperty('id');
    expect(mockReleaseCartAdRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: expect.any(Array) });
  });

  it('should update a release cart ad', async () => {
    const dto = new UpdateReleaseCartAdDto();
    dto.title = 'Updated Test Ad';
    const updatedAd = await service.update(1, dto, { id: 1 } as User);
    expect(updatedAd).toBeTruthy();
    expect(mockReleaseCartAdRepository.save).toHaveBeenCalled();
  });

  it('should delete a release cart ad', async () => {
    await service.remove(1, { id: 1 } as User);
    expect(mockReleaseCartAdRepository.delete).toHaveBeenCalled();
  });

  it('should throw error if user tries to modify status', async () => {
    const dto = new UpdateReleaseCartAdDto(); 
    dto.status = AdStatus.COMPLETED; 
    await expect(service.update(1, dto, { id: 1 } as User)).rejects.toThrow(ForbiddenException);
  });
});
