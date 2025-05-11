import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PersonalServiceTypesService } from './personal-service-types.service';
import { CreatePersonalServiceTypeDto } from './dto/create-personal-service-type.dto';
import { UpdatePersonalServiceTypeDto } from './dto/update-personal-service-type.dto';
import { PersonalServiceTypeDto } from './dto/personal-service-type.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Personal Service Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('personal-service-types')
export class PersonalServiceTypesController {
  constructor(private readonly service: PersonalServiceTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new personal service type' })
  @ApiResponse({
    status: 201,
    description: 'Created personal service type',
    type: PersonalServiceTypeDto,
  })
  create(
    @Body() dto: CreatePersonalServiceTypeDto,
  ): Promise<PersonalServiceTypeDto> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all personal service types' })
  @ApiResponse({
    status: 200,
    description: 'List of personal service types',
    type: [PersonalServiceTypeDto],
  })
  findAll(): Promise<PersonalServiceTypeDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a personal service type by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The personal service type',
    type: PersonalServiceTypeDto,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PersonalServiceTypeDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a personal service type by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The updated personal service type',
    type: PersonalServiceTypeDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonalServiceTypeDto,
  ): Promise<PersonalServiceTypeDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a personal service type by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Personal service type deleted' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
