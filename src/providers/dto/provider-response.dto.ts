import { ApiProperty } from '@nestjs/swagger';
import { ValidationStatus } from '../provider.entity';

export class ProviderResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty({ enum: ValidationStatus })
  status: ValidationStatus;

  @ApiProperty()
  identity_card_document: string;

  @ApiProperty()
  proof_of_business_document: string;

  @ApiProperty({ type: [String] })
  certification_documents: string[];

  @ApiProperty()
  bank_account: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  edited_at: Date;
}
