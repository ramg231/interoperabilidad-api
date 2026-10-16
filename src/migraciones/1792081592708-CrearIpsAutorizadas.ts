import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearIpsAutorizadas1792081592708 implements MigrationInterface {
    name = 'CrearIpsAutorizadas1792081592708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ips_autorizadas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entidad_id" uuid NOT NULL, "direccion" inet NOT NULL, "descripcion" character varying(200), "activo" boolean NOT NULL DEFAULT true, "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e3b90b46dbf6ad0d850e454d615" UNIQUE ("entidad_id", "direccion"), CONSTRAINT "PK_70ae849c50211ee86b9fffe1661" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ips_autorizadas" ADD CONSTRAINT "FK_86ae87ec843d276466992c518df" FOREIGN KEY ("entidad_id") REFERENCES "entidades"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ips_autorizadas" DROP CONSTRAINT "FK_86ae87ec843d276466992c518df"`);
        await queryRunner.query(`DROP TABLE "ips_autorizadas"`);
    }

}
