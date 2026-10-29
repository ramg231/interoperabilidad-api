import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacionModule } from '../autenticacion/autenticacion.module.js';
import { Matrimonio } from './modelos/matrimonio.entity.js';
import { MatrimoniosController } from './matrimonios.controller.js';
import { MatrimoniosService } from './matrimonios.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Matrimonio]),
    AutenticacionModule,
  ],
  controllers: [MatrimoniosController],
  providers: [MatrimoniosService],
})
export class MatrimoniosModule {}