import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdPaymentsService } from './ad-payments.service';
import { CreateAdPaymentDto } from './dto/create-ad-payment.dto';
import { UpdateAdPaymentDto } from './dto/update-ad-payment.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/user.entity';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('Ad Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ad-payments')
export class AdPaymentsController {
  constructor(private readonly adPaymentsService: AdPaymentsService) {}

  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin(@CurrentUser() user: User) {
    return this.adPaymentsService.findAllAdmin();
  }

  @Post()
  create(
    @Body() createAdPaymentDto: CreateAdPaymentDto,
    @CurrentUser() user: User,
  ) {
    return this.adPaymentsService.create(createAdPaymentDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.adPaymentsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.adPaymentsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdPaymentDto: UpdateAdPaymentDto,
    @CurrentUser() user: User,
  ) {
    return this.adPaymentsService.update(id, updateAdPaymentDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.adPaymentsService.remove(id, user);
  }
}
