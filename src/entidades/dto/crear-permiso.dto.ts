import { IsEnum } from 'class-validator';
import { ServicioConsulta } from '../modelos/permiso-servicio.entity.js';

export class CrearPermisoDto {
  @IsEnum(ServicioConsulta, {
    message: 'El servicio debe ser PREDIO, LICENCIA o MATRIMONIO',
  })
  servicio!: ServicioConsulta;
}