import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ConsultarLicenciasDto {
  @ApiProperty({
    description:
      'DNI de 8 dígitos o RUC de 11 dígitos. Enviar como texto.',
    example: '20123456789',
    type: String,
    pattern: '^(?:\\d{8}|\\d{11})$',
  })
  @IsString()
  @Matches(/^(?:\d{8}|\d{11})$/, {
    message:
      'El documento debe ser un DNI de 8 dígitos o RUC de 11 dígitos',
  })
  doc!: string;
}