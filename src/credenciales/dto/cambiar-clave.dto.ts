import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CambiarClaveDto {
  @IsString()
  @Matches(/^[a-z0-9._-]{4,100}$/)
  usuario!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  contrasenaActual!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  contrasenaNueva!: string;
}