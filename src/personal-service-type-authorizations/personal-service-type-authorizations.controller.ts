import {
  Controller,
  UseGuards,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  Query,
  HttpCode,
} from '@nestjs/common';
import { PersonalServiceTypeAuthorizationsService } from './personal-service-type-authorizations.service';
import { CreatePersonalServiceTypeAuthorizationDto } from './dto/create-personal-service-type-authorization.dto';
import { UpdatePersonalServiceTypeAuthorizationDto } from './dto/update-personal-service-type-authorization.dto';
import { PersonalServiceTypeAuthorizationDto } from './dto/personal-service-type-authorization.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Personal Service Type Authorizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('personal-service-type-authorizations')
export class PersonalServiceTypeAuthorizationsController {
  constructor(
    private readonly service: PersonalServiceTypeAuthorizationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new authorization' })
  @ApiResponse({ status: 201, type: PersonalServiceTypeAuthorizationDto })
  create(
    @Body() dto: CreatePersonalServiceTypeAuthorizationDto,
  ): Promise<PersonalServiceTypeAuthorizationDto> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List authorizations, optionally filtered by provider ID',
  })
  @ApiResponse({ status: 200, type: [PersonalServiceTypeAuthorizationDto] })
  @ApiQuery({ name: 'providerId', required: false, type: Number })
  findAll(
    @Query('providerId', new DefaultValuePipe(undefined), ParseIntPipe)
    providerId?: number,
  ): Promise<PersonalServiceTypeAuthorizationDto[]> {
    return this.service.findAll(providerId);
  }

  @Get(':providerId/:personalServiceTypeId')
  @ApiOperation({ summary: 'Get an authorization by composite key' })
  @ApiParam({ name: 'providerId', type: Number })
  @ApiParam({ name: 'personalServiceTypeId', type: Number })
  @ApiResponse({ status: 200, type: PersonalServiceTypeAuthorizationDto })
  findOne(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Param('personalServiceTypeId', ParseIntPipe) personalServiceTypeId: number,
  ): Promise<PersonalServiceTypeAuthorizationDto> {
    return this.service.findOne(providerId, personalServiceTypeId);
  }

  @Patch(':providerId/:personalServiceTypeId')
  @ApiOperation({ summary: 'Update an authorization' })
  @ApiParam({ name: 'providerId', type: Number })
  @ApiParam({ name: 'personalServiceTypeId', type: Number })
  @ApiResponse({ status: 200, type: PersonalServiceTypeAuthorizationDto })
  update(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Param('personalServiceTypeId', ParseIntPipe) personalServiceTypeId: number,
    @Body() dto: UpdatePersonalServiceTypeAuthorizationDto,
  ): Promise<PersonalServiceTypeAuthorizationDto> {
    return this.service.update(providerId, personalServiceTypeId, dto);
  }

  @Delete(':providerId/:personalServiceTypeId')
  @ApiOperation({ summary: 'Delete an authorization' })
  @ApiParam({ name: 'providerId', type: Number })
  @ApiParam({ name: 'personalServiceTypeId', type: Number })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @HttpCode(204)
  remove(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Param('personalServiceTypeId', ParseIntPipe) personalServiceTypeId: number,
  ): Promise<void> {
    return this.service.remove(providerId, personalServiceTypeId);
  }
}
