import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CrearEntidadDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El nombre no puede estar vacío' })
  @MaxLength(200)
  nombre!: string;

  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'El RUC debe contener exactamente 11 dígitos',
  })
  ruc!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  correoContacto?: string;
}