import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetProductsFiltersDTO } from './dtos/GetProductsFiltersDTO';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            softDelete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('softDeleteProduct', () => {
    it('should call productRepository.softDelete with the correct id', async () => {
      const id = '123';
      const softDeleteSpy = jest.spyOn(productRepository, 'softDelete');
      await service.softDeleteProduct(id);
      expect(softDeleteSpy).toHaveBeenCalledWith(id);
    });
  });

  describe('getProductsAvailable', () => {
    it('should return paginated products with the correct query', async () => {
      const payload: GetProductsFiltersDTO = {
        page: 1,
        limit: 10,
        name: 'test',
        category: 'electronics',
        minPrice: 100,
        maxPrice: 500,
      };

      const mockProducts = [{ id: '1', name: 'Product 1' }];
      const mockTotal = 1;
      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockProducts, mockTotal]),
      };

      jest
        .spyOn(productRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilderMock as any);

      const result = await service.getProductsAvailable(payload);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(productRepository.createQueryBuilder).toHaveBeenCalledWith(
        'product',
      );
      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        'product.deleteAt IS NULL',
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'product.name ILIKE :name',
        { name: `%${payload.name}%` },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'product.category ILIKE :category',
        { category: `%${payload.category}%` },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'product.price >= :minPrice',
        { minPrice: payload.minPrice },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'product.price <= :maxPrice',
        { maxPrice: payload.maxPrice },
      );
      expect(queryBuilderMock.take).toHaveBeenCalledWith(payload.limit);
      expect(queryBuilderMock.skip).toHaveBeenCalledWith(0);
      expect(queryBuilderMock.orderBy).toHaveBeenCalledWith(
        'product.createdAt',
        'DESC',
      );

      expect(result).toEqual({
        data: mockProducts,
        total: mockTotal,
        page: payload.page,
        limit: payload.limit,
        totalPages: Math.ceil(mockTotal / payload.limit),
      });
    });
  });
});
