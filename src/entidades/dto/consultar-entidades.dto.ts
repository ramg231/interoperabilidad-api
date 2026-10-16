import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ConsultarEntidadesDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @Matches(/^\d{11}$/, {
    message: 'El RUC debe contener exactamente 11 dígitos',
  })
  ruc?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite: number = 20;
}