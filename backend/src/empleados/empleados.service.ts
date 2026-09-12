import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity.js';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) {}

  async findAll(q?: string) {
    const query = this.empleadoRepository
      .createQueryBuilder('empleado')
      .leftJoinAndSelect('empleado.funcion', 'funcion')
      .leftJoinAndSelect('empleado.reparticion', 'reparticion')
      .orderBy('empleado.legajo', 'ASC');

    if (q) {
      const term = `%${q.toLowerCase()}%`;
      query.where(
        'LOWER(empleado.apellido) LIKE :term OR LOWER(empleado.nombres) LIKE :term',
        { term },
      );
    }

    return query.getMany();
  }

  async findOne(legajo: number) {
    const empleado = await this.empleadoRepository
      .createQueryBuilder('empleado')
      .leftJoinAndSelect('empleado.funcion', 'funcion')
      .leftJoinAndSelect('empleado.reparticion', 'reparticion')
      .where('empleado.legajo = :legajo', { legajo })
      .getOne();

    if (!empleado) {
      throw new NotFoundException(`Empleado con legajo ${legajo} no encontrado`);
    }

    return empleado;
  }

  async create(data: Partial<Empleado>) {
    const empleado = this.empleadoRepository.create(data);
    return this.empleadoRepository.save(empleado);
  }

  async update(legajo: number, data: Partial<Empleado>) {
    const empleado = await this.findOne(legajo);
    Object.assign(empleado, data);
    return this.empleadoRepository.save(empleado);
  }

  async remove(legajo: number) {
    const empleado = await this.findOne(legajo);
    await this.empleadoRepository.remove(empleado);
    return { deleted: empleado };
  }
}
