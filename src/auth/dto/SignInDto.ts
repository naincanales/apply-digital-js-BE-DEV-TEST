import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ default: 'admin' })
  username: string;

  @ApiProperty({ default: 'pass.123' })
  password: string;
}
