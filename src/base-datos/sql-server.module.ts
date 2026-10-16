import { Module } from '@nestjs/common';
import { SqlServerService } from './sql-server.service.js';

@Module({
  providers: [SqlServerService],
  exports: [SqlServerService],
})
export class SqlServerModule {}