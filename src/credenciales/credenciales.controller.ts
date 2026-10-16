import { Body, Controller, Header, Post } from '@nestjs/common';
import { CredencialesService } from './credenciales.service.js';
import { CrearCredencialDto } from './dto/crear-credencial.dto.js';
import { CambiarClaveDto } from './dto/cambiar-clave.dto.js';
@Controller('credenciales')
export class CredencialesController {
  constructor(
    private readonly credencialesService: CredencialesService,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  crear(@Body() datos: CrearCredencialDto) {
    return this.credencialesService.crear(datos);
  }

    @Post('cambiar-clave')
@Header('Cache-Control', 'no-store')
cambiarClave(@Body() datos: CambiarClaveDto) {
  return this.credencialesService.cambiarClave(datos);
}
}