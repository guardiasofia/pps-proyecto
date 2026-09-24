import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles, RolesGuard } from '../common/guards/roles.guard.js';
import { ReportesService } from './reportes.service.js';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('empleado/:id')
  @UseGuards(RolesGuard)
  @Roles('RRHH')
  generarReporteEmpleado(@Param('id') id: string, @Res() res: Response) {
    const pdf = this.reportesService.generarReporteEmpleado(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-${id}.pdf"`);
    return res.send(pdf);
  }

  @Get('solicitud/:id/pdf')
  @UseGuards(RolesGuard)
  @Roles('RRHH')
  generarReporteSolicitud(@Param('id') id: string, @Res() res: Response) {
    const pdf = this.reportesService.generarReporteSolicitud(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="solicitud-${id}.pdf"`);
    return res.send(pdf);
  }
}
