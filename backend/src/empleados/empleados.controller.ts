import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles, RolesGuard } from '../common/guards/roles.guard.js';
import { User } from '../common/decorators/user.decorator.js';
import { EmpleadosService } from './empleados.service.js';

@Controller('empleados')
@UseGuards(JwtAuthGuard)
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Get('me')
  findMine(@User('id') userId: string | number | null) {
    return this.empleadosService.findMine(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('RRHH')
  findAll(@Query('q') q?: string) {
    return this.empleadosService.findAll(q);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('RRHH')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.findOne(id);
  }
}
