import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Empleado } from './empleado.entity.js';

@Entity('reparticiones')
export class Reparticion {
  @PrimaryColumn({ type: 'int' })
  idreparticion!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  estado?: string;

  @Column({ type: 'timestamp', nullable: true })
  fechamod?: Date;

  @Column({ type: 'int', nullable: true })
  usuariomod?: number;

  @OneToMany(() => Empleado, (empleado) => empleado.reparticion)
  empleados?: Empleado[];
}
