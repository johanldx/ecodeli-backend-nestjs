import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ConfigurationsService } from './configurations.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { ConfigurationResponseDto } from './dto/configuration-response.dto';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Configurations')
@Controller('configurations')
export class ConfigurationsController {
  constructor(private readonly service: ConfigurationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOkResponse({ type: ConfigurationResponseDto })
  create(@Body() dto: CreateConfigurationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: ConfigurationResponseDto, isArray: true })
  findAll() {
    return this.service.findAll();
  }

  @Get(':key')
  @ApiOkResponse({ type: ConfigurationResponseDto })
  findByKey(@Param('key') key: string) {
    return this.service.findByKey(key);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOkResponse({ type: ConfigurationResponseDto })
  update(@Param('id') id: number, @Body() dto: UpdateConfigurationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOkResponse({ type: ConfigurationResponseDto })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
