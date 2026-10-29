import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EntidadesModule } from './entidades/entidades.module.js';
import { CredencialesModule } from './credenciales/credenciales.module.js';
import { AutenticacionModule } from './autenticacion/autenticacion.module.js';
import { PrediosModule } from './predios/predios.module.js';
import { LicenciasModule } from './licencias/licencias.module.js';
import { MatrimoniosModule } from './matrimonios/matrimonios.module.js';
 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<string>('DB_PORT')),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    EntidadesModule,

    CredencialesModule,

    AutenticacionModule,

    PrediosModule,

    LicenciasModule,
    MatrimoniosModule,
 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}