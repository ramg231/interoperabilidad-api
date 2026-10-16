import { Module } from '@nestjs/common';
import { AutenticacionModule } from '../autenticacion/autenticacion.module.js';
import { SqlServerModule } from '../base-datos/sql-server.module.js';
import { LicenciasController } from './licencias.controller.js';
import { LicenciasService } from './licencias.service.js';

@Module({
  imports: [AutenticacionModule, SqlServerModule],
  controllers: [LicenciasController],
  providers: [LicenciasService],
})
export class LicenciasModule {}