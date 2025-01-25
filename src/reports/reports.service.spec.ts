/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { Product } from '../products/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { ProductsAvailableDTO } from './dtos/ProductsAvailableDTO';

describe('ReportsService', () => {
  let service: ReportsService;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDeletedProductsPorcentage', () => {
    it('should calculate the percentage of deleted products', async () => {
      jest
        .spyOn(productRepository, 'count')
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3);

      const result = await service.getDeletedProductsPorcentage();

      expect(productRepository.count).toHaveBeenCalledTimes(2);
      expect(productRepository.count).toHaveBeenCalledWith({
        withDeleted: true,
      });
      expect(productRepository.count).toHaveBeenCalledWith({
        withDeleted: true,
        where: { deleteAt: Not(IsNull()) },
      });
      expect(result).toEqual({ total: 10, deleted: 3, percentage: '30.00' });
    });
  });

  describe('getProductsAvailablePorcentage', () => {
    it('should calculate the percentage of products meeting the filters', async () => {
      const filters: ProductsAvailableDTO = {
        withPrice: true,
        minDate: new Date('2024-01-01'),
        maxDate: new Date('2024-12-31'),
      };

      const queryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(30),
      };

      jest
        .spyOn(productRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilderMock as any);

      jest.spyOn(productRepository, 'count').mockResolvedValue(100);

      const result = await service.getProductsAvailablePorcentage(filters);

      expect(productRepository.createQueryBuilder).toHaveBeenCalledWith(
        'product',
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'product.price IS NOT NULL',
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'product.createdAt >= :minDate',
        { minDate: filters.minDate },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'product.createdAt <= :maxDate',
        { maxDate: filters.maxDate },
      );
      expect(queryBuilderMock.getCount).toHaveBeenCalled();
      expect(productRepository.count).toHaveBeenCalledWith({
        withDeleted: false,
      });

      expect(result).toEqual({
        total: 100,
        countFiltered: 30,
        percentage: '30.00',
      });
    });
  });

  describe('getOutStockPercentage', () => {
    it('should calculate the percentage of out-of-stock products', async () => {
      jest
        .spyOn(productRepository, 'count')
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(25);

      const result = await service.getOutStockPercentage();

      expect(productRepository.count).toHaveBeenCalledTimes(2);
      expect(productRepository.count).toHaveBeenCalledWith({
        withDeleted: false,
      });
      expect(productRepository.count).toHaveBeenCalledWith({
        withDeleted: false,
        where: { stock: 0 },
      });
      expect(result).toEqual({
        total: 100,
        totalOutStockProducts: 25,
        percentage: '25.00',
      });
    });
  });
});
