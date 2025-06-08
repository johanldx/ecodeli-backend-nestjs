import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  DefaultValuePipe,
  HttpCode,
} from '@nestjs/common';
import { ProviderSchedulesService } from './provider-schedules.service';
import { CreateProviderScheduleDto } from './dto/create-provider-schedule.dto';
import { UpdateProviderScheduleDto } from './dto/update-provider-schedule.dto';
import { ProviderScheduleDto } from './dto/provider-schedule.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Provider Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('provider-schedules')
export class ProviderSchedulesController {
  constructor(private readonly service: ProviderSchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a provider schedule' })
  @ApiResponse({ status: 201, type: ProviderScheduleDto })
  create(@Body() dto: CreateProviderScheduleDto): Promise<ProviderScheduleDto> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedules with optional filters' })
  @ApiResponse({ status: 200, type: [ProviderScheduleDto] })
  @ApiQuery({
    name: 'start',
    required: false,
    type: String,
    description: 'ISO date start filter',
  })
  @ApiQuery({
    name: 'end',
    required: false,
    type: String,
    description: 'ISO date end filter',
  })
  @ApiQuery({
    name: 'providerId',
    required: false,
    type: Number,
    description: 'ID du provider à filtrer',
  })
  @ApiQuery({
    name: 'personalServiceTypeId',
    required: false,
    type: Number,
    description: 'ID du type de service à filtrer',
  })
  findAll(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('providerId') providerId?: number,
    @Query('personalServiceTypeId') personalServiceTypeId?: number,
  ): Promise<ProviderScheduleDto[]> {
    const filters = {
      start: start ? new Date(start) : undefined,
      end: end ? new Date(end) : undefined,
      providerId,
      personalServiceTypeId,
    };
    return this.service.findFiltered(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a schedule by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ProviderScheduleDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProviderScheduleDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a schedule' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ProviderScheduleDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProviderScheduleDto,
  ): Promise<ProviderScheduleDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a schedule' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
