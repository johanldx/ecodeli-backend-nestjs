import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty({ description: 'Access token for the user', example: 'access_token_value' })
  access_token: string;

  @ApiProperty({ description: 'Refresh token for the user', example: 'refresh_token_value' })
  refresh_token: string;
}
