import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('matrimonios')
export class Matrimonio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'numero_acta',
    type: 'varchar',
    length: 30,
    unique: true,
  })
  numeroActa!: string;

  @Column({
    name: 'numero_expediente',
    type: 'varchar',
    length: 50,
  })
  numeroExpediente!: string;

  @Column({ type: 'text' })
  contrayentes!: string;

  @Column({
    name: 'fecha_ceremonia',
    type: 'date',
  })
  fechaCeremonia!: string;

  @Column({
    name: 'autoridad_celebrante',
    type: 'text',
  })
  autoridadCelebrante!: string;

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