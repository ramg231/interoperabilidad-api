import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearCredenciales1792079931252 implements MigrationInterface {
    name = 'CrearCredenciales1792079931252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "credenciales" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entidad_id" uuid NOT NULL, "usuario" character varying(100) NOT NULL, "contrasena_hash" text NOT NULL, "activo" boolean NOT NULL DEFAULT true, "fecha_vencimiento" TIMESTAMP WITH TIME ZONE, "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fecha_actualizacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_77d2fc32169e355e28972937278" UNIQUE ("usuario"), CONSTRAINT "PK_3b9840e9e8b6a8092e592b1907e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "credenciales" ADD CONSTRAINT "FK_c1b4110a8e3c5cd9a4437a23e14" FOREIGN KEY ("entidad_id") REFERENCES "entidades"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credenciales" DROP CONSTRAINT "FK_c1b4110a8e3c5cd9a4437a23e14"`);
        await queryRunner.query(`DROP TABLE "credenciales"`);
    }

}
