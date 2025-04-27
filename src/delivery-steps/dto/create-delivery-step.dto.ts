import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsEnum } from 'class-validator';
import { DeliveryStepStatus } from '../entities/delivery-step.entity';

export class CreateDeliveryStepDto {
  @ApiProperty({ description: 'ID de l’annonce de livraison associée' })
  @IsInt()
  @IsPositive()
  deliveryAdId: number;

  @ApiProperty({ description: 'Numéro d’ordre de l’étape' })
  @IsInt()
  @IsPositive()
  stepNumber: number;

  @ApiProperty({ description: 'Prix pour cette étape' })
  @IsInt()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'ID de la localisation de départ' })
  @IsInt()
  @IsPositive()
  departureLocationId: number;

  @ApiProperty({ description: 'ID de la localisation d’arrivée' })
  @IsInt()
  @IsPositive()
  arrivalLocationId: number;

  @ApiProperty({ description: 'Statut initial de l’étape', enum: DeliveryStepStatus, default: DeliveryStepStatus.PENDING })
  @IsEnum(DeliveryStepStatus)
  status?: DeliveryStepStatus;
}