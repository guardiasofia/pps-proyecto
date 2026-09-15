import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('emp_cud')
export class EmpCud {
  @PrimaryColumn({ name: 'idcud', type: 'int' })
  idCud!: number;

  @Column({ type: 'int', nullable: true })
  legajo?: number;

  @Column({ name: 'fechaemision', type: 'date', nullable: true })
  fechaEmision?: Date;

  @Column({ name: 'fechavencimiento', type: 'date', nullable: true })
  fechaVencimiento?: Date;

  @Column({ name: 'idarchivo', type: 'int', nullable: true })
  idArchivo?: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  estado?: string;

  @Column({ name: 'fechamod', type: 'timestamp', nullable: true })
  fechaMod?: Date;

  @Column({ name: 'usuariomod', type: 'int', nullable: true })
  usuarioMod?: number;
}
