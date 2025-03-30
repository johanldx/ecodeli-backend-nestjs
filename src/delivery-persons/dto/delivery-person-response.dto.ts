import { ApiProperty } from '@nestjs/swagger';
import { ValidationStatus } from '../delivery-person.entity';

export class DeliveryPersonResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty({ enum: ValidationStatus })
  status: ValidationStatus;

  @ApiProperty({
    example: 'https://cdn.ecodeli.fr/uuid-idcard.jpg',
    description: 'URL to the identity card',
    required: false,
  })
  identity_card_document?: string;

  @ApiProperty({
    example: 'https://cdn.ecodeli.fr/uuid-license.pdf',
    description: 'URL to the driver license',
    required: false,
  })
  driver_license_document?: string;

  @ApiProperty({ required: false })
  bank_account?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  edited_at: Date;
}
