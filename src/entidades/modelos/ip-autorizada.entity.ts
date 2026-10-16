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

@Entity('ips_autorizadas')
@Unique(['entidadId', 'direccion'])
export class IpAutorizada {
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

  @Column({ type: 'inet' })
  direccion!: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  descripcion!: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'timestamptz',
  })
  fechaCreacion!: Date;
}