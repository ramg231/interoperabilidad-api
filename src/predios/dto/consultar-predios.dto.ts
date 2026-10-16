import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ConsultarPrediosDto {
  @ApiProperty({
    description:
      'DNI de 8 dígitos o RUC de 11 dígitos. Enviar como texto.',
    example: '12345678',
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