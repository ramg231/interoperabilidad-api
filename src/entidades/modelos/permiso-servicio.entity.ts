import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Entidad } from './entidad.entity.js';

export enum ServicioConsulta {
  PREDIO = 'PREDIO',
  LICENCIA = 'LICENCIA',
  MATRIMONIO = 'MATRIMONIO',
}

@Entity('permisos_servicios')
@Unique(['entidadId', 'servicio'])
export class PermisoServicio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'entidad_id', type: 'uuid' })
  entidadId!: string;

  @ManyToOne(() => Entidad, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'entidad_id' })
  entidad!: Entidad;

  @Column({
    type: 'enum',
    enum: ServicioConsulta,
    enumName: 'servicio_consulta',
  })
  servicio!: ServicioConsulta;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'timestamptz',
  })
  fechaCreacion!: Date;
}