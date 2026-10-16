import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearEntidades1792079070599 implements MigrationInterface {
    name = 'CrearEntidades1792079070599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "entidades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(200) NOT NULL, "ruc" character varying(11) NOT NULL, "correo_contacto" character varying(254), "activo" boolean NOT NULL DEFAULT true, "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fecha_actualizacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_89a09a4cb7adda66a0b4bd51d02" UNIQUE ("ruc"), CONSTRAINT "PK_4ceb23ee98193c241ee43c95111" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "entidades"`);
    }

}
