import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles, RolesGuard } from '../common/guards/roles.guard.js';
import { User } from '../common/decorators/user.decorator.js';
import { CreateSolicitudDto } from './dto/create-solicitud.dto.js';
import { SolicitudesService } from './solicitudes.service.js';

@Controller('solicitudes')
@UseGuards(JwtAuthGuard)
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('RRHH')
  findAll() {
    return this.solicitudesService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('RRHH')
  findOne(@Param('id') id: string) {
    return this.solicitudesService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateSolicitudDto, @User('id') userId: string | number | null) {
    return this.solicitudesService.create(body, userId);
  }

  @Patch(':id/aprobar')
  @UseGuards(RolesGuard)
  @Roles('RRHH')
  aprobar(@Param('id') id: string, @Body() body: any) {
    return this.solicitudesService.aprobar(id, body);
  }
}
