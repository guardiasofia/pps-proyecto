import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('archivos')
export class Archivo {
  @PrimaryColumn({ name: 'idarchivo', type: 'int' })
  idArchivo!: number;

  @Column({ type: 'bytea', nullable: true })
  contenido?: Buffer;

  @Column({ name: 'tipoarchivo', type: 'varchar', length: 100, nullable: true })
  tipoArchivo?: string;

  @Column({
    name: 'nombrearchivo',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  nombreArchivo?: string;

  @Column({ name: 'fechacarga', type: 'date', nullable: true })
  fechaCarga?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  estado?: string;

  @Column({ name: 'fechamod', type: 'timestamp', nullable: true })
  fechaMod?: Date;

  @Column({ name: 'usuariomod', type: 'int', nullable: true })
  usuarioMod?: number;
}
