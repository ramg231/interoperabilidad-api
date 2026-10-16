import { IsBoolean } from 'class-validator';

export class ActualizarIpAutorizadaDto {
  @IsBoolean()
  activo!: boolean;
}