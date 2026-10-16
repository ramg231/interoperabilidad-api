import { SetMetadata } from '@nestjs/common';
import { ServicioConsulta } from '../entidades/modelos/permiso-servicio.entity.js';

export const CLAVE_SERVICIO_REQUERIDO = 'servicioRequerido';

export const ServicioRequerido = (servicio: ServicioConsulta) =>
  SetMetadata(CLAVE_SERVICIO_REQUERIDO, servicio);