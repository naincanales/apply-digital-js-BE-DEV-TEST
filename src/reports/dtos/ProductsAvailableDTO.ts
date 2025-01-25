import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductsAvailableDTO {
  @ApiPropertyOptional()
  @ApiProperty()
  @Transform(({ value }: { value: string }) => new Boolean(value))
  @IsOptional()
  @IsBoolean()
  withPrice: boolean;

  @ApiPropertyOptional()
  @ApiProperty()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  minDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  maxDate: Date;
}
