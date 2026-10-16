import { Body, Controller, Get, Post, Query , ParseUUIDPipe,Param,Patch} from '@nestjs/common';
import { EntidadesService } from './entidades.service.js';
import { CrearEntidadDto } from './dto/crear-entidad.dto.js';
import { ConsultarEntidadesDto } from './dto/consultar-entidades.dto.js';
import { CrearIpAutorizadaDto } from './dto/crear-ip-autorizada.dto.js';
import { ActualizarIpAutorizadaDto } from './dto/actualizar-ip-autorizada.dto.js';
import { CrearPermisoDto } from './dto/crear-permiso.dto.js';
import { ActualizarPermisoDto } from './dto/actualizar-permiso.dto.js';
@Controller('entidades')
export class EntidadesController {
  constructor(
    private readonly entidadesService: EntidadesService,
  ) {}

  @Post()
  crear(@Body() datos: CrearEntidadDto) {
    return this.entidadesService.crear(datos);
  }

  @Get()
  listar(@Query() filtros: ConsultarEntidadesDto) {
    return this.entidadesService.listar(filtros);
  }

  @Post(':id')
agregarIp(
  @Param('id', new ParseUUIDPipe()) entidadId: string,
  @Body() datos: CrearIpAutorizadaDto,
) {
  return this.entidadesService.agregarIp(entidadId, datos);
}

@Patch('ips/:id/:ipId')
cambiarEstadoIp(
  @Param('id', new ParseUUIDPipe()) entidadId: string,
  @Param('ipId', new ParseUUIDPipe()) ipId: string,
  @Body() datos: ActualizarIpAutorizadaDto,
) {
  return this.entidadesService.cambiarEstadoIp(
    entidadId,
    ipId,
    datos.activo,
  );
}
  @Post('permisos/:id')
agregarPermiso(
  @Param('id', new ParseUUIDPipe()) entidadId: string,
  @Body() datos: CrearPermisoDto,
) {
  return this.entidadesService.agregarPermiso(entidadId, datos);
}

@Patch('permisos/:id/:permisoId')
cambiarEstadoPermiso(
  @Param('id', new ParseUUIDPipe()) entidadId: string,
  @Param('permisoId', new ParseUUIDPipe()) permisoId: string,
  @Body() datos: ActualizarPermisoDto,
) {
  return this.entidadesService.cambiarEstadoPermiso(
    entidadId,
    permisoId,
    datos.activo,
  );
}
}

