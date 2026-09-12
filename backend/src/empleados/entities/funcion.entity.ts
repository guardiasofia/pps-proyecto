import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Empleado } from './empleado.entity.js';

@Entity('funciones')
export class Funcion {
  @PrimaryColumn({ type: 'int' })
  idfuncion!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  funcion?: string;

  @Column({ type: 'timestamp', nullable: true })
  fechamod?: Date;

  @Column({ type: 'int', nullable: true })
  usuariomod?: number;

  @OneToMany(() => Empleado, (empleado) => empleado.funcion)
  empleados?: Empleado[];
}
