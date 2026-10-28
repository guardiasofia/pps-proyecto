import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SolicitudesModule } from '../solicitudes/solicitudes.module.js';
import { ReportesController } from './reportes.controller.js';
import { ReportesService } from './reportes.service.js';

@Module({
  imports: [AuthModule, SolicitudesModule],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
