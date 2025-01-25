import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { GetProductsFiltersDTO } from './dtos/GetProductsFiltersDTO';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async softDeleteProduct(id: string): Promise<void> {
    await this.productRepository.softDelete(id);
  }
  async getProductsAvailable(payload: GetProductsFiltersDTO) {
    const offeset = (payload.page - 1) * payload.limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder.where('product.deleteAt IS NULL');

    if (payload.name) {
      queryBuilder.andWhere('product.name ILIKE :name', {
        name: `%${payload.name}%`,
      });
    }
    if (payload.category) {
      queryBuilder.andWhere('product.category ILIKE :category', {
        category: `%${payload.category}%`,
      });
    }
    if (payload.minPrice) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: payload.minPrice,
      });
    }
    if (payload.maxPrice) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: payload.maxPrice,
      });
    }

    const [products, total] = await queryBuilder
      .take(payload.limit)
      .skip(offeset)
      .orderBy('product.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: products,
      total,
      page: payload.page,
      limit: payload.limit,
      totalPages: Math.ceil(total / payload.limit),
    };
  }
}
