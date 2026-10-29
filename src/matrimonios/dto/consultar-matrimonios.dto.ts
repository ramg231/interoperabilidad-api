import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ConsultarMatrimoniosDto {
  @ApiProperty({
    description: 'Número de acta. Enviar como texto.',
    example: '1000000001',
    pattern: '^[0-9]{1,30}$',
  })
  @IsString()
  @Matches(/^[0-9]{1,30}$/, {
    message: 'numero_acta debe contener entre 1 y 30 dígitos',
  })
  numero_acta!: string;
}