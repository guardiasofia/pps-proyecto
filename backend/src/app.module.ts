import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { databaseConfig } from './config/database.config.js';
import { EmpleadosModule } from './empleados/empleados.module.js';
import { SolicitudesModule } from './solicitudes/solicitudes.module.js';
import { ReportesModule } from './reportes/reportes.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    EmpleadosModule,
    SolicitudesModule,
    ReportesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
