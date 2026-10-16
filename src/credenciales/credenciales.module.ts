import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredencialesController } from './credenciales.controller.js';
import { CredencialesService } from './credenciales.service.js';
import { Credencial } from './modelos/credencial.entity.js';
import { Entidad } from '../entidades/modelos/entidad.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Credencial, Entidad])],
  controllers: [CredencialesController],
  providers: [CredencialesService],
})
export class CredencialesModule {}