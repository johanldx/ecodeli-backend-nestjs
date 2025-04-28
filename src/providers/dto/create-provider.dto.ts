import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateProviderDto {
  @IsNotEmpty()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  bank_account: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  identity_card_document: string;

  @IsString()
  @IsOptional()
  proof_of_business_document: string;

  @IsString()
  @IsOptional()
  certification_documents: string[];
}
