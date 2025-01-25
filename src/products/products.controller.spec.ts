/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { GetProductsFiltersDTO } from './dtos/GetProductsFiltersDTO';
import { AuthGuard } from '../auth/auth.guard';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const mockAuthGuard = {
      canActivate: jest.fn(() => true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            softDeleteProduct: jest.fn(),
            getProductsAvailable: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('softDeleteProduct', () => {
    it('should call productService.softDeleteProduct with the correct id', async () => {
      const id = '123';
      const softDeleteSpy = jest.spyOn(service, 'softDeleteProduct');
      await controller.softDeleteProduct(id);
      expect(softDeleteSpy).toHaveBeenCalledWith(id);
    });
  });

  describe('getProductsAvailable', () => {
    it('should call productService.getProductsAvailable with the correct query', async () => {
      const query: GetProductsFiltersDTO = {
        page: 1,
        limit: 5,
        name: 'Series',
        category: 'Smartwatch',
        minPrice: 100,
        maxPrice: 500,
      };

      const mockResult = {
        data: [
          {
            id: '3LO1GPO3x1hjnVFzAp7V6S',
            sku: 'UVBY6AR9',
            name: 'Apple Watch Series 7',
            brand: 'Apple',
            model: 'Watch Series 7',
            category: 'Smartwatch',
            color: 'Black',
            price: 133.6,
            currency: 'USD',
            stock: 54,
            createdAt: new Date(),
            updatedAt: new Date(),
            deleteAt: undefined,
          },
        ],
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      };

      jest.spyOn(service, 'getProductsAvailable').mockResolvedValue(mockResult);

      const result = await controller.getProductsAvailable(query);

      expect(service.getProductsAvailable).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });
});
