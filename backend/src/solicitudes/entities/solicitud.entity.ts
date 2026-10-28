import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ name: 'empleado_id', type: 'int' })
  empleadoId!: number;

  @Column({ type: 'varchar', length: 40 })
  tipo!: string;

  @Column({ type: 'varchar', length: 20 })
  estado!: string;

  @Column({ type: 'jsonb' })
  cambios!: Record<string, unknown>;

  @Column({ name: 'valores_anteriores', type: 'jsonb', nullable: true })
  valoresAnteriores?: Record<string, unknown>;

  @Column({ name: 'creado_en', type: 'timestamptz' })
  creadoEn!: Date;

  @Column({
    name: 'aprobado_por',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  aprobadoPor?: string;

  @Column({ type: 'text', nullable: true })
  observacion?: string;

  @Column({ name: 'aprobado_en', type: 'timestamptz', nullable: true })
  aprobadoEn?: Date;
}
