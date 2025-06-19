import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { TokensDto } from './dto/tokens.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Client } from 'src/clients/client.entity';
import { ClientsService } from 'src/clients/clients.service';
import { DeliveryPersonsService } from 'src/delivery-persons/delivery-persons.service';
import { TradersService } from 'src/traders/traders.service';
import { ProvidersService } from 'src/providers/providers.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clientsService: ClientsService,
    private readonly deliveryPersonsService: DeliveryPersonsService,
    private readonly tradersService: TradersService,
    private readonly providersService: ProvidersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiBody({ type: RegisterDto })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in the user and generate tokens' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in and tokens generated',
    type: TokensDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account is inactive' })
  @ApiBody({ type: LoginDto })
  login(@Body() loginDto: LoginDto) {
    console.log('Corps de la requête : ', LoginDto);
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed',
    type: TokensDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid refresh token' })
  @ApiBody({ schema: { properties: { refresh_token: { type: 'string' } } } })
  refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiResponse({
    status: 200,
    description: 'Password reset instructions sent to email',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: ForgotPasswordDto })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password using the reset token' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  @ApiBody({ type: ResetPasswordDto })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get logged-in user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile information',
    type: UserResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update logged-in user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile successfully updated',
    type: UserResponseDto,
  })
  @ApiBody({ type: UpdateProfileDto })
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, updateProfileDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiResponse({ status: 200, description: 'User profile deleted' })
  @UseGuards(JwtAuthGuard)
  deleteProfile(@CurrentUser() user: User) {
    return this.authService.deleteProfile(user.id);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/clients')
  @ApiOperation({ summary: 'Get current user client profile' })
  @ApiResponse({ status: 200, description: 'Client found', type: Client })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getMyClient(@CurrentUser() user: User): Promise<Client> {
    return this.clientsService.findByUserId(user.id);
  }

  @Get('me/delivery-persons')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user delivery person profile' })
  async getMyDeliveryPerson(@CurrentUser() user: User) {
    return this.deliveryPersonsService.findByUserId(user.id);
  }

  @Get('me/traders')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user trader profile' })
  async getMyTrader(@CurrentUser() user: User) {
    return this.tradersService.findByUserId(user.id);
  }

  @Get('me/providers')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user provider profile' })
  async getMyProvider(@CurrentUser() user: User) {
    return this.providersService.findByUserId(user.id);
  }

  @Get('check-admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check if current user has admin rights' })
  @ApiResponse({ status: 200, description: 'Admin rights check result' })
  @ApiResponse({ status: 403, description: 'User is not an administrator' })
  async checkAdminRights(@CurrentUser() user: User) {
    return this.authService.checkAdminRights(user);
  }
}
