import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Funcion } from './funcion.entity.js';
import { Reparticion } from './reparticion.entity.js';

@Entity('empleados')
export class Empleado {
  @PrimaryColumn({ type: 'int' })
  legajo!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  apellido?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombres?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nrodocumento?: string;

  @Column({ type: 'date', nullable: true })
  f_nacimiento?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nacionalidad?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cuil?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  estadocivil?: string;

  @Column({ type: 'int', nullable: true })
  idfuncion?: number;

  @Column({ type: 'int', nullable: true })
  idreparticion?: number;

  @Column({ type: 'int', nullable: true })
  idarchivofoto?: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  estado?: string;

  @Column({ type: 'timestamp', nullable: true })
  fechamod?: Date;

  @Column({ type: 'int', nullable: true })
  usuariomod?: number;

  @ManyToOne(() => Funcion, (funcion) => funcion.empleados, { nullable: true })
  @JoinColumn({ name: 'idfuncion' })
  funcion?: Funcion;

  @ManyToOne(() => Reparticion, (reparticion) => reparticion.empleados, { nullable: true })
  @JoinColumn({ name: 'idreparticion' })
  reparticion?: Reparticion;
}
