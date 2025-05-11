import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePersonalServiceTypeAuthorizationDto {
  @ApiProperty({ description: 'ID of the provider' })
  @IsInt()
  @IsNotEmpty()
  providerId: number;

  @ApiProperty({ description: 'ID of the personal service type' })
  @IsInt()
  @IsNotEmpty()
  personalServiceTypeId: number;
}
