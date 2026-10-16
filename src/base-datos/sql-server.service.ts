import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sql from 'mssql';

@Injectable()
export class SqlServerService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(SqlServerService.name);

  readonly pool: InstanceType<typeof sql.ConnectionPool>;

  constructor(config: ConfigService) {
    this.pool = new sql.ConnectionPool({
      server: config.getOrThrow<string>('SQLSERVER_HOST'),
      port: Number(config.getOrThrow<string>('SQLSERVER_PORT')),
      database: config.getOrThrow<string>('SQLSERVER_DATABASE'),
      user: config.getOrThrow<string>('SQLSERVER_USERNAME'),
      password: config.getOrThrow<string>('SQLSERVER_PASSWORD'),

      options: {
        encrypt:
          config.getOrThrow<string>('SQLSERVER_ENCRYPT') === 'true',
        trustServerCertificate:
          config.getOrThrow<string>(
            'SQLSERVER_TRUST_SERVER_CERTIFICATE',
          ) === 'true',
      },

      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },

      connectionTimeout: 15000,
      requestTimeout: 30000,
    });

    this.pool.on('error', (error: Error) => {
      this.logger.error('Error en SQL Server', error.stack);
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.pool.connect();
      this.logger.log('Conexión a SQL Server establecida');
    } catch (error) {
      this.logger.error(
        'No se pudo conectar a SQL Server',
        error instanceof Error ? error.stack : undefined,
      );

      throw new Error('No se pudo iniciar la conexión a SQL Server');
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.close();
  }
}