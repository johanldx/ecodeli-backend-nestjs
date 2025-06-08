// src/traders/dto/trader-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ValidationStatus } from '../trader.entity';

export class TraderResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the trader',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The user associated with the trader',
    example: {
      id: 1,
      email: 'johndoe@example.com',
    },
  })
  user: {
    id: number;
    email: string;
    // Ajoutez ici d'autres propriétés liées à l'utilisateur
  };

  @ApiProperty({
    description: 'The current validation status of the trader',
    example: ValidationStatus.PENDING,
  })
  status: ValidationStatus;

  @ApiProperty({
    description: 'The identity card document URL or identifier',
    example: 'identity_card_document_url_or_id',
  })
  identity_card_document: string;

  @ApiProperty({
    description: 'The proof of business document URL or identifier',
    example: 'proof_of_business_document_url_or_id',
  })
  proof_of_business_document: string;

  @ApiProperty({
    description: 'The bank account associated with the trader',
    example: 'FR7630001007941234567890185',
  })
  bank_account: string;

  reduction_percent: number;

  @ApiProperty({
    description: 'The date when the trader was created',
    example: '2025-03-27T16:18:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'The date when the trader was last edited or updated',
    example: '2025-03-27T16:18:00.000Z',
  })
  edited_at: Date;
}
