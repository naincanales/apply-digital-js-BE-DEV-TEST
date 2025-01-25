/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Transform } from 'class-transformer';
import {
  IsInt,
  Max,
  Min,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsFiltersDTO {
  @ApiProperty({ default: 1 })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({ default: 5, minimum: 1, maximum: 5 })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @IsNumber()
  @Min(0)
  @Max(5)
  limit: number;

  @ApiPropertyOptional()
  @ApiProperty({ default: '' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @ApiProperty({ default: '' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @ApiProperty({ default: '' })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ default: '' })
  @ApiPropertyOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @IsNumber()
  @IsOptional()
  maxPrice?: number;
}
