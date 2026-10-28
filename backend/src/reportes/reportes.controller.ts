import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles, RolesGuard } from '../common/guards/roles.guard.js';
import { ReportesService } from './reportes.service.js';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('solicitud/:id/pdf')
  @UseGuards(RolesGuard)
  @Roles('RRHH')
  async generarReporteSolicitud(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.reportesService.generarReporteSolicitud(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="solicitud-${id}.pdf"`,
    );
    return res.send(pdf);
  }
}
