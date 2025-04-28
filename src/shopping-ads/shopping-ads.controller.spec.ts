import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingAdsController } from './shopping-ads.controller';
import { ShoppingAdsService } from './shopping-ads.service';
import { CreateShoppingAdDto } from './dto/create-shopping-ad.dto';
import { UpdateShoppingAdDto } from './dto/update-shopping-ad.dto';
import { ShoppingAdResponseDto } from './dto/shopping-ad-response.dto';
import { User } from 'src/users/user.entity';
import { ForbiddenException } from '@nestjs/common';
import { AdStatus, PackageSize } from './entities/shopping-ads.entity';

describe('ShoppingAdsController', () => {
  let controller: ShoppingAdsController;
  let service: ShoppingAdsService;

  const mockShoppingAdService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: 'password',
    active: true,
    administrator: false,
    created_at: new Date(),
    updated_at: new Date(),
    clients: [],
    locations: [],
    deliverySteps: [],
    deliveryAds: [],
    releaseCartAds: [],
    resetPasswordToken: null,
    shoppingAds: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShoppingAdsController],
      providers: [
        {
          provide: ShoppingAdsService,
          useValue: mockShoppingAdService,
        },
      ],
    }).compile();

    controller = module.get<ShoppingAdsController>(ShoppingAdsController);
    service = module.get<ShoppingAdsService>(ShoppingAdsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a shopping ad', async () => {
    const dto = new CreateShoppingAdDto();
    dto.title = 'Test Ad';
    dto.description = 'Test Description';
    dto.image_urls = ['test_image_url'];
    dto.status = 'pending' as AdStatus;
    dto.departure_location = 1;
    dto.arrival_location = 2;
    dto.package_size = 'M' as PackageSize;
    dto.shopping_list = ['item1', 'item2'];
    dto.price = 100;

    mockShoppingAdService.create.mockResolvedValue(dto);

    const result = await controller.create(dto);
    expect(result).toEqual(dto);
    expect(mockShoppingAdService.create).toHaveBeenCalledWith(dto, mockUser);
  });

  it('should find all shopping ads', async () => {
    const shoppingAds = [
      new ShoppingAdResponseDto(),
      new ShoppingAdResponseDto(),
    ];
    mockShoppingAdService.findAll.mockResolvedValue(shoppingAds);

    const result = await controller.findAll({});
    expect(result).toEqual(shoppingAds);
    expect(mockShoppingAdService.findAll).toHaveBeenCalled();
  });

  it('should find a shopping ad by ID', async () => {
    const shoppingAd = new ShoppingAdResponseDto();
    mockShoppingAdService.findOne.mockResolvedValue(shoppingAd);

    const result = await controller.findOne(1);
    expect(result).toEqual(shoppingAd);
    expect(mockShoppingAdService.findOne).toHaveBeenCalledWith(1, mockUser);
  });

  it('should update a shopping ad', async () => {
    const dto = new UpdateShoppingAdDto();
    dto.title = 'Updated Test Ad';
    mockShoppingAdService.update.mockResolvedValue(dto);

    const result = await controller.update(1, dto);
    expect(result).toEqual(dto);
    expect(mockShoppingAdService.update).toHaveBeenCalledWith(1, dto, mockUser);
  });

  it('should delete a shopping ad', async () => {
    mockShoppingAdService.remove.mockResolvedValue(undefined);

    await controller.remove(1);
    expect(mockShoppingAdService.remove).toHaveBeenCalledWith(1, mockUser);
  });

  it('should throw forbidden exception when user tries to update status', async () => {
    const dto = new UpdateShoppingAdDto();
    dto.status = 'completed' as AdStatus;

    mockShoppingAdService.update.mockRejectedValue(new ForbiddenException());

    await expect(controller.update(1, dto)).rejects.toThrow(ForbiddenException);
  });
});
