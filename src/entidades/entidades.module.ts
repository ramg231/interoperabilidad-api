import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntidadesController } from './entidades.controller.js';
import { EntidadesService } from './entidades.service.js';
import { Entidad } from './modelos/entidad.entity.js';
import { IpAutorizada } from './modelos/ip-autorizada.entity.js';
import { Credencial } from '../credenciales/modelos/credencial.entity.js';
import { PermisoServicio } from './modelos/permiso-servicio.entity.js';
@Module({
  imports: [TypeOrmModule.forFeature([Entidad, IpAutorizada, Credencial, PermisoServicio])],
  controllers: [EntidadesController],
  providers: [EntidadesService],
})
export class EntidadesModule {}