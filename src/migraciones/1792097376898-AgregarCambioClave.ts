import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarCambioClave1792097376898 implements MigrationInterface {
    name = 'AgregarCambioClave1792097376898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credenciales" ADD "requiere_cambio_clave" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credenciales" DROP COLUMN "requiere_cambio_clave"`);
    }

}
