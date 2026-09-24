import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module.js';
import { SolicitudesModule } from '../solicitudes/solicitudes.module.js';
import { ReportesController } from './reportes.controller.js';
import { ReportesService } from './reportes.service.js';

@Module({
  imports: [PassportModule, AuthModule, SolicitudesModule],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
