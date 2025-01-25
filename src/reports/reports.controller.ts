import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ProductsAvailableDTO } from './dtos/ProductsAvailableDTO';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reportService: ReportsService) {}
  @Get('deleted-products')
  async getDeletedProducts() {
    return await this.reportService.getDeletedProductsPorcentage();
  }

  @Get('products-available')
  async getProductsAvailable(@Query() query: ProductsAvailableDTO) {
    return await this.reportService.getProductsAvailablePorcentage(query);
  }

  @Get()
  async getReports() {
    return await this.reportService.getOutStockPercentage();
  }
}
