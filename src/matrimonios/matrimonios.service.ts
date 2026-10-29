import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matrimonio } from './modelos/matrimonio.entity.js';
import { ConsultarMatrimoniosDto } from './dto/consultar-matrimonios.dto.js';

@Injectable()
export class MatrimoniosService {
  private readonly logger = new Logger(MatrimoniosService.name);

  constructor(
    @InjectRepository(Matrimonio)
    private readonly matrimonios: Repository<Matrimonio>,
  ) {}

  async consultar(datos: ConsultarMatrimoniosDto) {
    let acta: Matrimonio | null;

    try {
      acta = await this.matrimonios.findOneBy({
        numeroActa: datos.numero_acta,
      });
    } catch {
      this.logger.error('Error al consultar matrimonios en PostgreSQL');

      throw new ServiceUnavailableException(
        'No se pudo realizar la consulta de matrimonios',
      );
    }

    if (!acta) {
      return {
        total: 0,
        datos: [],
      };
    }

    return {
      total: 1,
      datos: [
        {
          numero_acta: acta.numeroActa,
          numero_expediente: acta.numeroExpediente,
          contrayentes: acta.contrayentes,
          fecha_ceremonia: acta.fechaCeremonia,
          autoridad_celebrante: acta.autoridadCelebrante,
        },
      ],
    };
  }
}