import { PartialType } from '@nestjs/swagger';
import { CreateShoppingAdDto } from './create-shopping-ad.dto';

export class UpdateShoppingAdDto extends PartialType(CreateShoppingAdDto) {}
