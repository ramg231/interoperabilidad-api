import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('entidades')
export class Entidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  nombre!: string;

  @Column({ type: 'varchar', length: 11, unique: true })
  ruc!: string;

  @Column({
    name: 'correo_contacto',
    type: 'varchar',
    length: 254,
    nullable: true,
  })
  correoContacto!: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'timestamptz',
  })
  fechaCreacion!: Date;

  @UpdateDateColumn({
    name: 'fecha_actualizacion',
    type: 'timestamptz',
  })
  fechaActualizacion!: Date;
}