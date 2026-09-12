import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn({ name: 'usucodigo', type: 'int' })
  usuCodigo!: number;

  @Column({ name: 'usunombre', type: 'varchar', length: 255, nullable: true })
  usuNombre?: string;

  @Column({ name: 'idrol', type: 'int', nullable: true })
  idRol?: number;

  @Column({ name: 'estado', type: 'varchar', length: 20, nullable: true })
  estado?: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true, select: false })
  passwordHash?: string;
}