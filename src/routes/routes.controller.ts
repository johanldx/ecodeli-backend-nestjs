import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteResponseDto } from './dto/route-response.dto';

@ApiTags('Routes')
@ApiBearerAuth()
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Route created successfully',
    type: RouteResponseDto,
  })
  async create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns the list of routes',
    type: [RouteResponseDto],
  })
  async findAll() {
    return this.routesService.findAll();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Returns the route by ID',
    type: RouteResponseDto,
  })
  async findOne(@Param('id') id: number) {
    return this.routesService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Route updated successfully',
    type: RouteResponseDto,
  })
  async update(
    @Param('id') id: number,
    @Body() updateRouteDto: UpdateRouteDto,
  ) {
    return this.routesService.update(id, updateRouteDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Route deleted successfully' })
  async remove(@Param('id') id: number) {
    return this.routesService.remove(id);
  }
}
