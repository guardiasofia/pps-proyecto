import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity.js';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    private readonly dataSource: DataSource,
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

  async findMine(userId: string | number | null) {
    if (userId === null || userId === undefined || userId === '') {
      throw new NotFoundException('El usuario no tiene un legajo asociado');
    }

    const links = await this.dataSource.query(
      `SELECT legajo FROM usuarioslegajos WHERE usucodigo = $1 AND estado = 'AC' LIMIT 1`,
      [Number(userId)],
    ) as Array<{ legajo: number }>;
    const legajo = links[0]?.legajo;
    if (!legajo) throw new NotFoundException('El usuario no tiene un legajo asociado');
    return this.findDetail(legajo);
  }

  async findDetail(legajo: number) {
    const empleado = await this.findOne(legajo);
    const [direccion, familiares, estudios, cud, cuenta, catalogos] = await Promise.all([
      this.dataSource.query(`SELECT legajo, calle, callenro, barrio, ciudad, provincia, tel1, tel2, email, f_actualiz, estado FROM direcciones WHERE legajo = $1 AND estado = 'AC' LIMIT 1`, [legajo]),
      this.dataSource.query(`SELECT legajo, numfamiliar, apellido, nombres, parentesco, discapacitado, estado FROM familiares WHERE legajo = $1 AND estado = 'AC' ORDER BY numfamiliar`, [legajo]),
      this.dataSource.query(`SELECT ee.legajo, ee.codestudio, ee.titulo, ee.f_graduado, ee.institucion, ee.ciudad, ee.estado, e.estudio FROM empestudios ee LEFT JOIN estudios e ON e.codestudio = ee.codestudio WHERE ee.legajo = $1 AND ee.estado = 'AC' ORDER BY ee.f_graduado DESC NULLS LAST`, [legajo]),
      this.dataSource.query(`SELECT ec.legajo, ec.fechaemision, ec.fechavencimiento, ec.idarchivo, ec.estado, a.nombrearchivo, a.tipoarchivo FROM emp_cud ec LEFT JOIN archivos a ON a.idarchivo = ec.idarchivo WHERE ec.legajo = $1 AND ec.estado = 'AC' ORDER BY ec.fechaemision DESC NULLS LAST LIMIT 1`, [legajo]),
      this.dataSource.query(`SELECT u.usucodigo, u.usunombre, u.apenom, u.email, u.estado, r.idrol, r.descripcion AS rol FROM usuarioslegajos ul JOIN usuarios u ON u.usucodigo = ul.usucodigo LEFT JOIN roles r ON r.idrol = u.idrol WHERE ul.legajo = $1 AND ul.estado = 'AC' AND u.estado = 'AC' LIMIT 1`, [legajo]),
      this.dataSource.query(`SELECT codestudio, estudio FROM estudios ORDER BY estudio`, []),
    ]);

    return {
      ...empleado,
      direccion: direccion[0] ?? null,
      familiares,
      estudios,
      cud: cud[0] ?? null,
      cuenta: cuenta[0] ?? null,
      catalogos: { estudios: catalogos },
    };
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
