import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStepStatus } from '../entities/delivery-step.entity';

export class DeliveryStepResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({
    description: 'ID de l’utilisateur ayant reçu cette étape',
    required: false,
  })
  receivedById?: number;

  @ApiProperty({ description: 'ID de l’annonce de livraison associée' })
  deliveryAdId: number;

  @ApiProperty({ description: 'Numéro d’ordre de l’étape' })
  stepNumber: number;

  @ApiProperty({ description: 'Prix pour cette étape' })
  price: number;

  @ApiProperty({ enum: DeliveryStepStatus })
  status: DeliveryStepStatus;

  @ApiProperty({ description: 'ID localisation départ' })
  departureLocationId: number;

  @ApiProperty({ description: 'ID localisation arrivée' })
  arrivalLocationId: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
