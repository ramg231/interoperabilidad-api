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
import { ConsultarPrediosDto } from './dto/consultar-predios.dto.js';
import { PrediosService } from './predios.service.js';

@ApiTags('Predios')
@ApiBasicAuth()
@Controller('predios')
@UseGuards(AccesoGuard)
export class PrediosController {
  constructor(
    private readonly prediosService: PrediosService,
  ) {}

  @Post('consultar')
  @HttpCode(200)
  @ServicioRequerido(ServicioConsulta.PREDIO)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Consultar predios por DNI o RUC',
    description:
      'Consulta el año actual según la zona horaria America/Lima. ' +
      'Requiere permiso PREDIO. Sin coincidencias devuelve total 0 y datos [].',
  })
  @ApiOkResponse({
    description: 'Consulta realizada correctamente.',
    schema: {
      example: {
        anio: 2026,
        total: 1,
        datos: [
          {
            p_ndocumento: '12345678',
            p_codpredio: 100,
            p_nombre: 'PERSONA DE EJEMPLO',
            p_direcc: 'DIRECCIÓN DE EJEMPLO',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Documento inválido o campos no permitidos.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Credenciales ausentes, inválidas, inactivas o vencidas; ' +
      'también si la entidad está inactiva.',
  })
  @ApiForbiddenResponse({
    description:
      'Cambio de clave pendiente, IP no autorizada o sin permiso PREDIO.',
  })
  @ApiServiceUnavailableResponse({
    description: 'No se pudo realizar la consulta en SQL Server.',
  })
  consultar(@Body() datos: ConsultarPrediosDto) {
    return this.prediosService.consultar(datos);
  }
}