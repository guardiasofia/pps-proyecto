import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empleado } from '../empleados/entities/empleado.entity.js';
import { Archivo } from './entities/archivo.entity.js';
import { EmpCud } from './entities/emp-cud.entity.js';
import { SolicitudesController } from './solicitudes.controller.js';
import { SolicitudesService } from './solicitudes.service.js';

@Module({
  imports: [PassportModule, AuthModule, TypeOrmModule.forFeature([Empleado, Archivo, EmpCud])],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
  exports: [SolicitudesService],
})
export class SolicitudesModule {}
