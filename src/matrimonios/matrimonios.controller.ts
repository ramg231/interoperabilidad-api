import {
  Body,
  Controller,
  Header,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccesoGuard } from '../autenticacion/guards/acceso.guard.js';
import { ServicioRequerido } from '../autenticacion/servicio-requerido.decorator.js';
import { ServicioConsulta } from '../entidades/modelos/permiso-servicio.entity.js';
import { ConsultarMatrimoniosDto } from './dto/consultar-matrimonios.dto.js';
import { MatrimoniosService } from './matrimonios.service.js';

@ApiTags('Matrimonios')
@ApiBasicAuth()
@Controller('matrimonios')
@UseGuards(AccesoGuard)
export class MatrimoniosController {
  constructor(
    private readonly matrimoniosService: MatrimoniosService,
  ) {}

  @Post('consultar')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @ServicioRequerido(ServicioConsulta.MATRIMONIO)
  @ApiOperation({
    summary: 'Consultar matrimonio por número de acta',
    description:
      'Requiere credenciales válidas, IP autorizada y permiso MATRIMONIO. ' +
      'Sin coincidencias devuelve total 0 y datos [].',
  })
  @ApiOkResponse({
    description: 'Consulta realizada correctamente.',
    schema: {
      example: {
        total: 1,
        datos: [
          {
            numero_acta: '1000000001',
            numero_expediente: '001-2026',
            contrayentes: 'PERSONA DE EJEMPLO Y OTRA PERSONA DE EJEMPLO',
            fecha_ceremonia: '2026-01-08',
            autoridad_celebrante: 'AUTORIDAD DE EJEMPLO',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Número de acta inválido o campos no permitidos.',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales ausentes, inválidas o no vigentes.',
  })
  @ApiForbiddenResponse({
    description:
      'Cambio de clave pendiente, IP no autorizada o sin permiso MATRIMONIO.',
  })
  @ApiServiceUnavailableResponse({
    description: 'No se pudo consultar PostgreSQL.',
  })
  consultar(@Body() datos: ConsultarMatrimoniosDto) {
    return this.matrimoniosService.consultar(datos);
  }
}