/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ProductsAvailableDTO } from './dtos/ProductsAvailableDTO';
import { AuthGuard } from '../auth/auth.guard';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  beforeEach(async () => {
    const mockAuthGuard = {
      canActivate: jest.fn(() => true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getDeletedProductsPorcentage: jest.fn(),
            getProductsAvailablePorcentage: jest.fn(),
            getOutStockPercentage: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDeletedProducts', () => {
    it('should call reportService.getDeletedProductsPorcentage and return the result', async () => {
      const mockResult = { percentage: '20.00', total: 10, deleted: 3 };
      jest
        .spyOn(service, 'getDeletedProductsPorcentage')
        .mockResolvedValue(mockResult);

      const result = await controller.getDeletedProducts();

      expect(service.getDeletedProductsPorcentage).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getProductsAvailable', () => {
    it('should call reportService.getProductsAvailablePorcentage with the correct query', async () => {
      const query: ProductsAvailableDTO = {
        withPrice: true,
        minDate: new Date(),
        maxDate: new Date(),
      };
      const mockResult = { percentage: '50', countFiltered: 100, total: 200 };

      jest
        .spyOn(service, 'getProductsAvailablePorcentage')
        .mockResolvedValue(mockResult);

      const result = await controller.getProductsAvailable(query);

      expect(service.getProductsAvailablePorcentage).toHaveBeenCalledWith(
        query,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getReports', () => {
    it('should call reportService.getOutStockPercentage and return the result', async () => {
      const mockResult = {
        percentage: '15',
        totalOutStockProducts: 30,
        total: 200,
      };
      jest
        .spyOn(service, 'getOutStockPercentage')
        .mockResolvedValue(mockResult);

      const result = await controller.getReports();

      expect(service.getOutStockPercentage).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
});
