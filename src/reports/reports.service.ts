import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { ProductsAvailableDTO } from './dtos/ProductsAvailableDTO';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async getDeletedProductsPorcentage() {
    const total = await this.productRepository.count({ withDeleted: true });
    const deleted = await this.productRepository.count({
      withDeleted: true,
      where: {
        deleteAt: Not(IsNull()),
      },
    });
    const percentage = (deleted / total) * 100;
    return { total, deleted, percentage: percentage.toFixed(2) };
  }

  async getProductsAvailablePorcentage(filters: ProductsAvailableDTO) {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    const { withPrice, minDate, maxDate } = filters;

    if (withPrice != undefined) {
      if (withPrice) {
        queryBuilder.andWhere('product.price IS NOT NULL');
      } else {
        queryBuilder.andWhere('product.price IS NULL');
      }
    }
    if (minDate && maxDate) {
      queryBuilder.andWhere('product.createdAt >= :minDate', {
        minDate: minDate,
      });
      queryBuilder.andWhere('product.createdAt <= :maxDate', {
        maxDate: maxDate,
      });
    }
    const countTotalFiltered = await queryBuilder.getCount();
    const total = await this.productRepository.count({ withDeleted: false });

    const percentage = (countTotalFiltered / total) * 100;
    return {
      total,
      countFiltered: countTotalFiltered,
      percentage: percentage.toFixed(2),
    };
  }

  async getOutStockPercentage() {
    const total = await this.productRepository.count({ withDeleted: false });
    const totalOutStockProducts = await this.productRepository.count({
      withDeleted: false,
      where: { stock: 0 },
    });
    const percentage = (totalOutStockProducts / total) * 100;
    return { total, totalOutStockProducts, percentage: percentage.toFixed(2) };
  }
}
