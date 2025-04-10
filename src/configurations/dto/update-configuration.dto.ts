import { IsOptional, IsString } from 'class-validator';

export class UpdateConfigurationDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  value?: string;
}
