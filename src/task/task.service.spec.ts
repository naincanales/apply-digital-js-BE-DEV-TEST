import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TaskService', () => {
  let service: TaskService;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const mockProducts = {
    items: [
      {
        fields: { sku: 'sku123', name: 'Product 1' },
        sys: {
          id: '1',
          createdAt: '2023-01-01',
          updatedAt: '2023-01-02',
        },
      },
    ],
  };

  describe('handleCron', () => {
    beforeEach(() => {
      process.env.CONTENTFUL_SPACE_ID = 'space_id';
      process.env.CONTENTFUL_ACCESS_TOKEN = 'access_token';
      process.env.CONTENTFUL_ENVIRONMENT = 'environment_id';
      process.env.CONTENTFUL_CONTENT_TYPE = 'content_type';
    });

    it('should save new products if they do not exist in the database', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(null);
      const saveSpy = jest.spyOn(productRepository, 'save');

      await service.handleCron();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://cdn.contentful.com/spaces/space_id/environments/environment_id/entries?access_token=access_token&content_type=content_type`,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { sku: 'sku123' },
      });
      expect(saveSpy).toHaveBeenCalledWith({
        ...mockProducts.items[0].fields,
        createdAt: mockProducts.items[0].sys.createdAt,
        updatedAt: mockProducts.items[0].sys.updatedAt,
        id: mockProducts.items[0].sys.id,
      });
    });
  });

  it('should update existing products if they already exist in the database', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });

    const existingProduct = {
      sku: 'sku123',
      name: 'Old Product',
      id: '1',
      brand: 'Brand',
      model: 'Model',
      category: 'Category',
      color: 'Color',
      price: 100,
      currency: 'USD',
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: undefined,
    };
    jest
      .spyOn(productRepository, 'findOne')
      .mockResolvedValueOnce(existingProduct);
    const updateSpy = jest.spyOn(productRepository, 'update');

    await service.handleCron();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `https://cdn.contentful.com/spaces/space_id/environments/environment_id/entries?access_token=access_token&content_type=content_type`,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(productRepository.findOne).toHaveBeenCalledWith({
      where: { sku: 'sku123' },
    });
    expect(updateSpy).toHaveBeenCalledWith(
      { sku: 'sku123' },
      {
        ...mockProducts.items[0].fields,
        updatedAt: mockProducts.items[0].sys.updatedAt,
      },
    );
  });
});
