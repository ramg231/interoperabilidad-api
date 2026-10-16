import { Module } from '@nestjs/common';
import { AutenticacionModule } from '../autenticacion/autenticacion.module.js';
import { SqlServerModule } from '../base-datos/sql-server.module.js';
import { PrediosController } from './predios.controller.js';
import { PrediosService } from './predios.service.js';

@Module({
  imports: [AutenticacionModule, SqlServerModule],
  controllers: [PrediosController],
  providers: [PrediosService],
})
export class PrediosModule {}