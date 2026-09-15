import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
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
  findAll(@Query('q') q?: string) {
    return this.empleadosService.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.empleadosService.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.empleadosService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.remove(id);
  }
}
