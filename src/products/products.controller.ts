import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { GetProductsFiltersDTO } from './dtos/GetProductsFiltersDTO';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async softDeleteProduct(@Param('id') id: string): Promise<void> {
    await this.productService.softDeleteProduct(id);
  }

  @Get('')
  async getProductsAvailable(@Query() query: GetProductsFiltersDTO) {
    return this.productService.getProductsAvailable(query);
  }
}
