import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearMatrimonios1793286000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "matrimonios" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "numero_acta" varchar(30) NOT NULL,
        "numero_expediente" varchar(50) NOT NULL,
        "contrayentes" text NOT NULL,
        "fecha_ceremonia" date NOT NULL,
        "autoridad_celebrante" text NOT NULL,
        "fecha_creacion" timestamptz NOT NULL DEFAULT now(),
        "fecha_actualizacion" timestamptz NOT NULL DEFAULT now(),

        CONSTRAINT "PK_matrimonios"
          PRIMARY KEY ("id"),

        CONSTRAINT "UQ_matrimonios_numero_acta"
          UNIQUE ("numero_acta"),

        CONSTRAINT "CK_matrimonios_numero_acta"
          CHECK ("numero_acta" ~ '^[0-9]{1,30}$')
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "matrimonios"');
  }
}