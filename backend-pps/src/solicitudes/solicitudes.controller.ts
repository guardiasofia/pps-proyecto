import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles, RolesGuard } from '../common/guards/roles.guard.js';
import { CreateSolicitudDto } from './dto/create-solicitud.dto.js';
import { SolicitudesService } from './solicitudes.service.js';

@Controller('solicitudes')
@UseGuards(JwtAuthGuard)
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('rrhh', 'rrhh-admin', 'admin')
  findAll(@Req() req: any) {
    return this.solicitudesService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('rrhh', 'rrhh-admin', 'admin', 'empleado')
  findOne(@Param('id') id: string) {
    return this.solicitudesService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateSolicitudDto) {
    return this.solicitudesService.create(body);
  }

  @Patch(':id/aprobar')
  @UseGuards(RolesGuard)
  @Roles('rrhh', 'rrhh-admin', 'admin')
  aprobar(@Param('id') id: string, @Body() body: any) {
    return this.solicitudesService.aprobar(id, body);
  }
}
