/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    if ((await this.productRepository.count()) === 0) {
      await this.perfomFechedData();
    }
  }

  private readonly logger = new Logger(TaskService.name);
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    await this.perfomFechedData();
  }
  async perfomFechedData() {
    try {
      const space_id = process.env.CONTENTFUL_SPACE_ID;
      const access_token = process.env.CONTENTFUL_ACCESS_TOKEN;
      const environment_id = process.env.CONTENTFUL_ENVIRONMENT;
      const content_type = process.env.CONTENTFUL_CONTENT_TYPE;
      const API_URL = `https://cdn.contentful.com/spaces/${space_id}/environments/${environment_id}/entries?access_token=${access_token}&content_type=${content_type}`;
      const response = await axios.get(API_URL);
      const { data: products } = response;

      for (const product of products.items) {
        const { fields } = product;
        const { sku } = fields;
        const productExists = await this.productRepository.findOne({
          where: { sku },
        });
        if (!productExists) {
          await this.productRepository.save({
            ...fields,
            createdAt: product.sys.createdAt,
            updatedAt: product.sys.updatedAt,
            id: product.sys.id,
          });
        } else {
          await this.productRepository.update(
            { sku: productExists.sku },
            {
              ...fields,
              updatedAt: product.sys.updatedAt,
            },
          );
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
