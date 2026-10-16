import {
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CrearCredencialDto {
  @IsUUID()
  entidadId!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(100)
  @Matches(/^[a-z0-9._-]+$/, {
    message:
      'El usuario solo permite minúsculas, números, puntos, guiones y guiones bajos',
  })
  usuario!: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  fechaVencimiento?: string;
}