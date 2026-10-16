import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Entidad } from '../entidades/modelos/entidad.entity.js';
import { IpAutorizada } from '../entidades/modelos/ip-autorizada.entity.js';
import { Credencial } from '../credenciales/modelos/credencial.entity.js';
import { PermisoServicio } from '../entidades/modelos/permiso-servicio.entity.js';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Entidad, IpAutorizada, Credencial, PermisoServicio],
  migrations: ['dist/migraciones/*.js'],
  synchronize: false,
});