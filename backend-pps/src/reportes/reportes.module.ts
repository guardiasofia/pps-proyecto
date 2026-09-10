import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module.js';
import { ReportesController } from './reportes.controller.js';
import { ReportesService } from './reportes.service.js';

@Module({
  imports: [PassportModule, AuthModule],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
