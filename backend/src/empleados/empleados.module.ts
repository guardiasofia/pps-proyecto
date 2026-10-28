import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Empleado } from './entities/empleado.entity.js';
import { Funcion } from './entities/funcion.entity.js';
import { Reparticion } from './entities/reparticion.entity.js';
import { EmpleadosController } from './empleados.controller.js';
import { EmpleadosService } from './empleados.service.js';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Empleado, Funcion, Reparticion])],
  controllers: [EmpleadosController],
  providers: [EmpleadosService],
  exports: [EmpleadosService],
})
export class EmpleadosModule {}
