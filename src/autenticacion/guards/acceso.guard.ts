import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AutenticacionService } from '../autenticacion.service.js';
import { Reflector } from '@nestjs/core';
import { ServicioConsulta } from '../../entidades/modelos/permiso-servicio.entity.js';
import { CLAVE_SERVICIO_REQUERIDO } from '../servicio-requerido.decorator.js';

@Injectable()
export class AccesoGuard implements CanActivate {
constructor(
  private readonly autenticacionService: AutenticacionService,
  private readonly reflector: Reflector,
) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const solicitud = contexto.switchToHttp().getRequest<Request>();
    const encabezado = solicitud.headers.authorization;

    if (!encabezado || encabezado.length > 2048) {
      throw new UnauthorizedException('Debe enviar Basic Auth');
    }

    const partes = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(encabezado);

    if (!partes) {
      throw new UnauthorizedException('Basic Auth inválido');
    }

    const contenido = Buffer.from(partes[1], 'base64').toString('utf8');
    const separador = contenido.indexOf(':');

    if (separador < 1) {
      throw new UnauthorizedException('Basic Auth inválido');
    }

    const usuario = contenido.slice(0, separador);
    const contrasena = contenido.slice(separador + 1);

    if (!contrasena || usuario.length > 100 || contrasena.length > 128) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Conexión directa al servidor, sin confiar en encabezados del cliente.
    let direccion = solicitud.socket.remoteAddress;

    if (!direccion) {
      throw new UnauthorizedException(
        'No se pudo identificar la IP de origen',
      );
    }

    // Node puede representar una IPv4 como ::ffff:10.150.50.25.
       if (direccion.startsWith('::ffff:')) {
      direccion = direccion.slice(7);
    }

    const servicio = this.reflector.getAllAndOverride<
      ServicioConsulta | undefined
    >(
      CLAVE_SERVICIO_REQUERIDO,
      [contexto.getHandler(), contexto.getClass()],
    );

    await this.autenticacionService.validar(
      usuario,
      contrasena,
      direccion,
      servicio,
    );

    return true;
  }
}