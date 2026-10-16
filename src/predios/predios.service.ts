import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import sql from 'mssql';
import { SqlServerService } from '../base-datos/sql-server.service.js';
import { ConsultarPrediosDto } from './dto/consultar-predios.dto.js';

export interface PredioResultado {
  p_ndocumento: string | null;
  p_codpredio: number | null;
  p_nombre: string | null;
  p_direcc: string | null;
}

@Injectable()
export class PrediosService {
  private readonly logger = new Logger(PrediosService.name);

  constructor(
    private readonly sqlServer: SqlServerService,
  ) {}

  async consultar(datos: ConsultarPrediosDto) {
    const anio = Number(
      new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        timeZone: 'America/Lima',
      }).format(new Date()),
    );

    try {
      await this.sqlServer.pool.connect();

      const resultado = await this.sqlServer.pool
        .request()
        .input('doc', sql.VarChar(11), datos.doc)
        .input('anio', sql.Int, anio)
        .query<PredioResultado>(`
          SELECT
            CONTRI.CONTRI_T_NUMDOC AS p_ndocumento,
            PREDIO.PREDIO_N_CODIGO AS p_codpredio,
            CONTRI.CONTRI_T_NOMCON AS p_nombre,
            DIRPRE.DIRECC_T_DESDIR AS p_direcc
          FROM TG_HOJA_RESUMEN AS HR
          LEFT JOIN TG_CONTRIBUYENTE AS CONTRI
            ON HR.CONTRI_N_CONSIS = CONTRI.CONTRI_N_CONSIS
          LEFT JOIN TG_PREDIO_HISTORIA AS PREHIS
            ON HR.HOJRES_N_CODIGO = PREHIS.HOJRES_N_CODIGO
          LEFT JOIN TG_PREDIO AS PREDIO
            ON PREDIO.PREDIO_N_CODIGO = PREHIS.PREDIO_N_CODIGO
          LEFT JOIN TG_DIRECCION AS DIRPRE
            ON DIRPRE.DIRECC_N_CODIGO = PREDIO.DIRECC_N_CODIGO
          WHERE HR.HOJRES_F_ACTIVO = 1
            AND CONTRI.CONTRI_F_ACTIVO = 1
            AND HR.ANOFIS_N_CODIGO = @anio
            AND CONTRI.CONTRI_T_NUMDOC = @doc
        `);

      return {
        anio,
        total: resultado.recordset.length,
        datos: resultado.recordset.map((predio) => ({
          p_ndocumento: predio.p_ndocumento?.trim() ?? null,
          p_codpredio: predio.p_codpredio,
          p_nombre: predio.p_nombre?.trim() ?? null,
          p_direcc: predio.p_direcc?.trim() ?? null,
        })),
      };
    } catch (error) {
      this.logger.error(
        'Falló la consulta de Predios',
        error instanceof Error ? error.stack : undefined,
      );

      throw new ServiceUnavailableException(
        'El servicio de Predios no está disponible temporalmente',
      );
    }
  }
}