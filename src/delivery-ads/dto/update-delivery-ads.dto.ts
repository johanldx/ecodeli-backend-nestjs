import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryAdDto } from './create-delivery-ads.dto';

export class UpdateDeliveryAdDto extends PartialType(CreateDeliveryAdDto) {
  // Le champ 'status' est volontairement exclu.
  // Il sera modifié uniquement via une route spécifique.
}
