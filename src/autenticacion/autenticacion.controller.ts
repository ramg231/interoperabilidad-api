import {
  Controller,
  Get,
  Header,
  UseGuards,
} from '@nestjs/common';
import { AccesoGuard } from './guards/acceso.guard.js';
import { ServicioRequerido } from './servicio-requerido.decorator.js';
import { ServicioConsulta } from '../entidades/modelos/permiso-servicio.entity.js';
@Controller('autenticacion')
export class AutenticacionController {
  @Get('verificar')
  @UseGuards(AccesoGuard)
  @Header('Cache-Control', 'no-store')
  verificar() {
    return {
      mensaje: 'Credenciales e IP autorizadas',
    };
  }

  @Get('verificar/predio')
@UseGuards(AccesoGuard)
@ServicioRequerido(ServicioConsulta.PREDIO)
@Header('Cache-Control', 'no-store')
verificarPredio() {
  return {
    mensaje: 'Acceso autorizado al servicio PREDIO',
  };
}
}