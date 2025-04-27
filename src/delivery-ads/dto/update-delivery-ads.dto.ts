import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryAdDto } from './create-delivery-ads.dto';

export class UpdateDeliveryAdDto extends PartialType(CreateDeliveryAdDto) {}
