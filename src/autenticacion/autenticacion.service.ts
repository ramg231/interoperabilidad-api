import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { Credencial } from '../credenciales/modelos/credencial.entity.js';
import { IpAutorizada } from '../entidades/modelos/ip-autorizada.entity.js';
import {
  PermisoServicio,
  ServicioConsulta,
} from '../entidades/modelos/permiso-servicio.entity.js';


@Injectable()
export class AutenticacionService {
  constructor(
    @InjectRepository(Credencial)
    private readonly credenciales: Repository<Credencial>,

    @InjectRepository(IpAutorizada)
    private readonly ips: Repository<IpAutorizada>,

    @InjectRepository(PermisoServicio)
    private readonly permisos: Repository<PermisoServicio>,
  ) { }

  async validar(
    usuario: string,
    contrasena: string,
    direccion: string,
    servicio?: ServicioConsulta,
  ): Promise<void> {
    const credencial = await this.credenciales
      .createQueryBuilder('credencial')
      .addSelect('credencial.contrasenaHash')
      .innerJoinAndSelect('credencial.entidad', 'entidad')
      .where('credencial.usuario = :usuario', { usuario })
      .getOne();

    if (
      !credencial ||
      !credencial.activo ||
      !credencial.entidad.activo ||
      (credencial.fechaVencimiento !== null &&
        credencial.fechaVencimiento.getTime() <= Date.now())
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const coincide = await argon2.verify(
      credencial.contrasenaHash,
      contrasena,
    );

    if (!coincide) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (credencial.requiereCambioClave) {
      throw new ForbiddenException(
        'Debe cambiar la contraseña provisional',
      );
    }

    const autorizada = await this.ips
      .createQueryBuilder('ip')
      .where('ip.entidadId = :entidadId', {
        entidadId: credencial.entidadId,
      })
      .andWhere('ip.activo = true')
      .andWhere('ip.direccion = CAST(:direccion AS inet)', {
        direccion,
      })
      .getOne();

    if (!autorizada) {
      throw new ForbiddenException(
        'La IP de origen no está autorizada',
      );
    }
    if (servicio !== undefined) {
  const permiso = await this.permisos.findOneBy({
    entidadId: credencial.entidadId,
    servicio,
    activo: true,
  });

  if (!permiso) {
    throw new ForbiddenException(
      `La entidad no tiene permiso para consultar ${servicio}`,
    );
  }
}
  }
}