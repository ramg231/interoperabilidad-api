import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { Credencial } from '../credenciales/modelos/credencial.entity.js';
import { ConsultarEntidadesDto } from './dto/consultar-entidades.dto.js';
import { CrearEntidadDto } from './dto/crear-entidad.dto.js';
import { CrearIpAutorizadaDto } from './dto/crear-ip-autorizada.dto.js';
import { Entidad } from './modelos/entidad.entity.js';
import { IpAutorizada } from './modelos/ip-autorizada.entity.js';
import { PermisoServicio } from './modelos/permiso-servicio.entity.js';
import { CrearPermisoDto } from './dto/crear-permiso.dto.js';

@Injectable()
export class EntidadesService {
  constructor(
    @InjectRepository(Entidad)
    private readonly repositorio: Repository<Entidad>,

    @InjectRepository(Credencial)
    private readonly credenciales: Repository<Credencial>,

    @InjectRepository(IpAutorizada)
    private readonly ips: Repository<IpAutorizada>,

    @InjectRepository(PermisoServicio)
    private readonly permisos: Repository<PermisoServicio>,
  ) {}

  async crear(datos: CrearEntidadDto): Promise<Entidad> {
    const entidad = this.repositorio.create({
      nombre: datos.nombre.trim(),
      ruc: datos.ruc,
      correoContacto: datos.correoContacto ?? null,
    });

    try {
      return await this.repositorio.save(entidad);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'Ya existe una entidad registrada con ese RUC',
        );
      }

      throw error;
    }
  }

  async listar(filtros: ConsultarEntidadesDto) {
    const { pagina, limite, nombre, ruc } = filtros;

    const consulta = this.repositorio.createQueryBuilder('entidad');

    if (nombre?.trim()) {
      consulta.andWhere('entidad.nombre ILIKE :nombre', {
        nombre: `%${nombre.trim()}%`,
      });
    }

    if (ruc) {
      consulta.andWhere('entidad.ruc = :ruc', { ruc });
    }

    const [entidades, total] = await consulta
      .orderBy('entidad.nombre', 'ASC')
      .addOrderBy('entidad.id', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    const ids = entidades.map((entidad) => entidad.id);

    if (ids.length === 0) {
      return {
        datos: [],
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    }

    const [credenciales, ips] = await Promise.all([
      this.credenciales.find({
        where: { entidadId: In(ids) },
        select: {
          id: true,
          entidadId: true,
          usuario: true,
          activo: true,
          fechaVencimiento: true,
          fechaCreacion: true,
          fechaActualizacion: true,
        },
        order: { usuario: 'ASC' },
      }),
      this.ips.find({
        where: { entidadId: In(ids) },
        order: { fechaCreacion: 'ASC' },
      }),
    ]);

    return {
      datos: entidades.map((entidad) => ({
        ...entidad,
        credenciales: credenciales.filter(
          (credencial) => credencial.entidadId === entidad.id,
        ),
        ipsAutorizadas: ips.filter(
          (ip) => ip.entidadId === entidad.id,
        ),
      })),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async agregarIp(
    entidadId: string,
    datos: CrearIpAutorizadaDto,
  ): Promise<IpAutorizada> {
    const entidad = await this.repositorio.findOneBy({
      id: entidadId,
    });

    if (!entidad) {
      throw new NotFoundException('La entidad no existe');
    }

    if (!entidad.activo) {
      throw new BadRequestException('La entidad está inactiva');
    }

    const ip = this.ips.create({
      entidadId,
      direccion: datos.direccion,
      descripcion: datos.descripcion?.trim() || null,
    });

    try {
      return await this.ips.save(ip);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'La IP ya está registrada para esta entidad',
        );
      }

      throw error;
    }
  }
  async cambiarEstadoIp(
  entidadId: string,
  ipId: string,
  activo: boolean,
): Promise<IpAutorizada> {
  const ip = await this.ips.findOneBy({
    id: ipId,
    entidadId,
  });

  if (!ip) {
    throw new NotFoundException(
      'La IP no está registrada para esta entidad',
    );
  }

  ip.activo = activo;

  return this.ips.save(ip);
}
  async agregarPermiso(
  entidadId: string,
  datos: CrearPermisoDto,
): Promise<PermisoServicio> {
  const entidad = await this.repositorio.findOneBy({
    id: entidadId,
  });

  if (!entidad) {
    throw new NotFoundException('La entidad no existe');
  }

  if (!entidad.activo) {
    throw new BadRequestException('La entidad está inactiva');
  }

  const permiso = this.permisos.create({
    entidadId,
    servicio: datos.servicio,
  });

  try {
    return await this.permisos.save(permiso);
  } catch (error) {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === '23505'
    ) {
      throw new ConflictException(
        'El servicio ya está registrado para esta entidad; puede cambiar su estado',
      );
    }

    throw error;
  }
}

async cambiarEstadoPermiso(
  entidadId: string,
  permisoId: string,
  activo: boolean,
): Promise<PermisoServicio> {
  const permiso = await this.permisos.findOneBy({
    id: permisoId,
    entidadId,
  });

  if (!permiso) {
    throw new NotFoundException(
      'El permiso no está registrado para esta entidad',
    );
  }

  permiso.activo = activo;

  return this.permisos.save(permiso);
}



}