import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { QueryFailedError, Repository } from 'typeorm';
import { Entidad } from '../entidades/modelos/entidad.entity.js';
import { CrearCredencialDto } from './dto/crear-credencial.dto.js';
import { Credencial } from './modelos/credencial.entity.js';
import { CambiarClaveDto } from './dto/cambiar-clave.dto.js';
@Injectable()
export class CredencialesService {
  constructor(
    @InjectRepository(Credencial)
    private readonly credenciales: Repository<Credencial>,

    @InjectRepository(Entidad)
    private readonly entidades: Repository<Entidad>,
  ) {}

  async crear(datos: CrearCredencialDto) {
    const entidad = await this.entidades.findOneBy({
      id: datos.entidadId,
    });

    if (!entidad) {
      throw new NotFoundException('La entidad no existe');
    }

    if (!entidad.activo) {
      throw new BadRequestException('La entidad está inactiva');
    }

    const fechaVencimiento = datos.fechaVencimiento
      ? new Date(datos.fechaVencimiento)
      : null;

    if (
      fechaVencimiento &&
      fechaVencimiento.getTime() <= Date.now()
    ) {
      throw new BadRequestException(
        'La fecha de vencimiento debe ser futura',
      );
    }

    const contrasena = randomBytes(24).toString('base64url');

    const contrasenaHash = await argon2.hash(contrasena, {
      type: argon2.argon2id,
    });

    const credencial = this.credenciales.create({
      entidadId: entidad.id,
      usuario: datos.usuario,
      contrasenaHash,
      fechaVencimiento,
    });

    try {
      const guardada = await this.credenciales.save(credencial);

      return {
        id: guardada.id,
        entidadId: guardada.entidadId,
        usuario: guardada.usuario,
        activo: guardada.activo,
        fechaVencimiento: guardada.fechaVencimiento,
        contrasenaTemporal: contrasena,
        mensaje:
          'Guarde la contraseña en el gestor institucional. No podrá consultarla nuevamente en la API.',
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('El usuario ya está registrado');
      }

      throw error;
    }
  }


  async cambiarClave(datos: CambiarClaveDto) {
  const credencial = await this.credenciales
    .createQueryBuilder('credencial')
    .addSelect('credencial.contrasenaHash')
    .innerJoinAndSelect('credencial.entidad', 'entidad')
    .where('credencial.usuario = :usuario', {
      usuario: datos.usuario,
    })
    .getOne();

  if (
    !credencial ||
    !credencial.activo ||
    !credencial.entidad.activo ||
    (credencial.fechaVencimiento !== null &&
      credencial.fechaVencimiento.getTime() <= Date.now())
  ) {
    throw new UnauthorizedException(
      'Credenciales inválidas o acceso no disponible',
    );
  }

  const claveCorrecta = await argon2.verify(
    credencial.contrasenaHash,
    datos.contrasenaActual,
  );

  if (!claveCorrecta) {
    throw new UnauthorizedException(
      'Credenciales inválidas o acceso no disponible',
    );
  }

  if (!credencial.requiereCambioClave) {
    throw new BadRequestException(
      'La credencial ya completó el cambio de clave provisional',
    );
  }

  const mismaClave = await argon2.verify(
    credencial.contrasenaHash,
    datos.contrasenaNueva,
  );

  if (mismaClave) {
    throw new BadRequestException(
      'La nueva contraseña debe ser diferente de la actual',
    );
  }

  const nuevoHash = await argon2.hash(datos.contrasenaNueva, {
    type: argon2.argon2id,
  });

  const resultado = await this.credenciales.update(
    {
      id: credencial.id,
      contrasenaHash: credencial.contrasenaHash,
      requiereCambioClave: true,
      activo: true,
    },
    {
      contrasenaHash: nuevoHash,
      requiereCambioClave: false,
    },
  );

  if (resultado.affected !== 1) {
    throw new ConflictException(
      'La credencial cambió durante la operación. Intente nuevamente',
    );
  }

  return {
    mensaje: 'Contraseña actualizada correctamente',
    requiereCambioClave: false,
  };
}
}