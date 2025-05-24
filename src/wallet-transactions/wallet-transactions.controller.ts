import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WalletTransactionsService } from './wallet-transactions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/user.entity';

@Controller('wallet-transactions')
@ApiTags('Wallet Transactions')
@ApiBearerAuth()
export class WalletTransactionsController {
  constructor(private readonly service: WalletTransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateWalletTransactionDto, @CurrentUser() user: User) {
    return this.service.create(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  findMine(@CurrentUser() user: User) {
    return this.service.findAllByUser(user);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.service.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.service.findOne(id, user);
  }
}
