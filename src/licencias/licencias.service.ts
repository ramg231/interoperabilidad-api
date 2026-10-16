import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import sql from 'mssql';
import { SqlServerService } from '../base-datos/sql-server.service.js';
import { ConsultarLicenciasDto } from './dto/consultar-licencias.dto.js';

export interface LicenciaResultado {
  l_doc: string;
  l_nombre: string;
  l_nlicencia: string;
  l_expediente: string;
  l_actividad: string;
  l_domicilio_fiscal: string;
  l_direccion: string;
}

@Injectable()
export class LicenciasService {
  private readonly logger = new Logger(LicenciasService.name);

  constructor(
    private readonly sqlServer: SqlServerService,
  ) {}

  async consultar(datos: ConsultarLicenciasDto) {
    try {
      await this.sqlServer.pool.connect();

      const resultado = await this.sqlServer.pool
        .request()
        .input('doc', sql.VarChar(11), datos.doc)
        .query<LicenciaResultado>(`
          ;WITH Licencias AS (
            SELECT
              A.ANOFIS_N_CODIGO,
              ISNULL(RTRIM(B.CONTRI_T_NUMDOC), '') AS l_doc,
              ISNULL(RTRIM(B.CONTRI_T_NOMCON), '') AS l_nombre,
              ISNULL(RTRIM(A.LICITS_T_NUMLIC), '') AS l_nlicencia,
              ISNULL(RTRIM(A.LICITS_T_NUMEXP), '') AS l_expediente,
              ISNULL(RTRIM(BB.ACTECO_T_DESACT), '') AS l_actividad,
              ISNULL(RTRIM(A.LICITS_T_DOMFIS), '') AS l_domicilio_fiscal,
              ISNULL(RTRIM(L.DIRECC_T_DESDIR), '') AS l_direccion,
              MAX(A.ANOFIS_N_CODIGO) OVER (
                PARTITION BY
                  B.CONTRI_T_NUMDOC,
                  RTRIM(A.LICITS_T_NUMLIC)
              ) AS max_anio
            FROM dbo.TG_LICENCIA_ITSE A
            INNER JOIN dbo.TG_LICENCIA_ESTADO EST
              ON A.LICEST_N_CODIGO = EST.LICEST_N_CODIGO
            INNER JOIN dbo.TG_CONTRIBUYENTE B
              ON A.CONTRI_N_CONSIS = B.CONTRI_N_CONSIS
              AND B.CONTRI_F_ACTIVO = 1
            LEFT JOIN dbo.TG_ESTABLECIMIENTO J
              ON A.ESTABL_N_CODIGO = J.ESTABL_N_CODIGO
              AND J.ESTABL_F_ACTIVO = 1
            LEFT JOIN dbo.TG_PREDIO K
              ON J.PREDIO_N_CODIGO = K.PREDIO_N_CODIGO
              AND K.PREDIO_F_ACTIVO = 1
            LEFT JOIN dbo.TG_DIRECCION L
              ON K.DIRECC_N_CODIGO = L.DIRECC_N_CODIGO
              AND L.DIRECC_F_ACTIVO = 1
            INNER JOIN dbo.TG_LICENCIA_ACTIVIDAD AA
              ON A.LICITS_N_CODIGO = AA.LICITS_N_CODIGO
              AND AA.LICACT_F_ACTIVO = 1
            LEFT JOIN dbo.TG_ACTIVIDAD_ECONOMICA BB
              ON AA.ACTECO_N_CODIGO = BB.ACTECO_N_CODIGO
              AND BB.ACTECO_F_ACTIVO = 1
            WHERE A.LICITS_F_ACTIVO = 1
              AND A.LICEST_N_CODIGO = 3
              AND B.CONTRI_T_NUMDOC = @doc
          )
          SELECT
            l_doc,
            l_nombre,
            l_nlicencia,
            l_expediente,
            l_actividad,
            l_domicilio_fiscal,
            l_direccion
          FROM Licencias
          WHERE ANOFIS_N_CODIGO = max_anio
        `);

      return {
        total: resultado.recordset.length,
        datos: resultado.recordset,
      };
    } catch (error) {
      this.logger.error(
        'Falló la consulta de Licencias',
        error instanceof Error ? error.stack : undefined,
      );

      throw new ServiceUnavailableException(
        'El servicio de Licencias no está disponible temporalmente',
      );
    }
  }
}