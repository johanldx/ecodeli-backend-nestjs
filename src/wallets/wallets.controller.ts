import { Controller, Get, UseGuards } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/user.entity';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  getMyWallet(@CurrentUser() user: User) {
    return this.walletsService.getMyWallet(user);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('/all')
  findAllWallets() {
    return this.walletsService.findAll();
  }
}
