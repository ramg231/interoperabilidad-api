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
import { ConsultarLicenciasDto } from './dto/consultar-licencias.dto.js';
import { LicenciasService } from './licencias.service.js';

@ApiTags('Licencias')
@ApiBasicAuth()
@Controller('licencias')
@UseGuards(AccesoGuard)
export class LicenciasController {
  constructor(
    private readonly licenciasService: LicenciasService,
  ) {}

  @Post('consultar')
  @HttpCode(200)
  @ServicioRequerido(ServicioConsulta.LICENCIA)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Consultar licencias por DNI o RUC',
    description:
      'Consulta registros activos en estado 3 y conserva el mayor año ' +
      'por documento y número de licencia entre esos registros. ' +
      'Puede devolver varias actividades por licencia. ' +
      'Requiere permiso LICENCIA. Sin coincidencias devuelve total 0 y datos [].',
  })
  @ApiOkResponse({
    description: 'Consulta realizada correctamente.',
    schema: {
      example: {
        total: 1,
        datos: [
          {
            l_doc: '20123456789',
            l_nombre: 'EMPRESA DE EJEMPLO',
            l_nlicencia: '00000001',
            l_expediente: '001-2026',
            l_actividad: 'ACTIVIDAD DE EJEMPLO',
            l_domicilio_fiscal: 'DOMICILIO DE EJEMPLO',
            l_direccion: 'DIRECCIÓN DE EJEMPLO',
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
      'Cambio de clave pendiente, IP no autorizada o sin permiso LICENCIA.',
  })
  @ApiServiceUnavailableResponse({
    description: 'No se pudo realizar la consulta en SQL Server.',
  })
  consultar(@Body() datos: ConsultarLicenciasDto) {
    return this.licenciasService.consultar(datos);
  }
}