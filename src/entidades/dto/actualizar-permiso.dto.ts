import { IsBoolean } from 'class-validator';

export class ActualizarPermisoDto {
  @IsBoolean()
  activo!: boolean;
}