import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Entidad } from '../../entidades/modelos/entidad.entity.js';

@Entity('credenciales')
export class Credencial {
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

  @Column({ type: 'varchar', length: 100, unique: true })
  usuario!: string;

  @Column({
    name: 'contrasena_hash',
    type: 'text',
    select: false,
  })
  contrasenaHash!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({
    name: 'fecha_vencimiento',
    type: 'timestamptz',
    nullable: true,
  })
  fechaVencimiento!: Date | null;

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
@Column({
  name: 'requiere_cambio_clave',
  type: 'boolean',
  default: true,
})
requiereCambioClave!: boolean;

}