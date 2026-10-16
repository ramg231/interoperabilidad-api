import {
  IsIP,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearIpAutorizadaDto {
  @IsIP()
  direccion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;
}