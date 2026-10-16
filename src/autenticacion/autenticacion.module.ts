import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacionController } from './autenticacion.controller.js';
import { AutenticacionService } from './autenticacion.service.js';
import { AccesoGuard } from './guards/acceso.guard.js';
import { Credencial } from '../credenciales/modelos/credencial.entity.js';
import { IpAutorizada } from '../entidades/modelos/ip-autorizada.entity.js';
import { PermisoServicio } from '../entidades/modelos/permiso-servicio.entity.js';
@Module({
  imports: [
    TypeOrmModule.forFeature([Credencial, IpAutorizada, PermisoServicio]),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, AccesoGuard],
  exports: [AutenticacionService, AccesoGuard],
})
export class AutenticacionModule {}