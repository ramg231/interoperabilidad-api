import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearPermisosServicios1792156904232 implements MigrationInterface {
    name = 'CrearPermisosServicios1792156904232'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."servicio_consulta" AS ENUM('PREDIO', 'LICENCIA', 'MATRIMONIO')`);
        await queryRunner.query(`CREATE TABLE "permisos_servicios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entidad_id" uuid NOT NULL, "servicio" "public"."servicio_consulta" NOT NULL, "activo" boolean NOT NULL DEFAULT true, "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_477344fff8674083e74dba5cb2f" UNIQUE ("entidad_id", "servicio"), CONSTRAINT "PK_49ce3e4b669a7bc57ee12eb2b39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "permisos_servicios" ADD CONSTRAINT "FK_fe037f160125650f3026a1bd748" FOREIGN KEY ("entidad_id") REFERENCES "entidades"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "permisos_servicios" DROP CONSTRAINT "FK_fe037f160125650f3026a1bd748"`);
        await queryRunner.query(`DROP TABLE "permisos_servicios"`);
        await queryRunner.query(`DROP TYPE "public"."servicio_consulta"`);
    }

}
