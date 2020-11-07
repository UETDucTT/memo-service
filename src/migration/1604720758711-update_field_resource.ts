import {MigrationInterface, QueryRunner} from "typeorm";

export class updateFieldResource1604720758711 implements MigrationInterface {
    name = 'updateFieldResource1604720758711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `diary_resource` ADD `name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `diary_resource` CHANGE `type` `type` enum ('image', 'audio', 'video', 'document', 'other') NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `diary_resource` CHANGE `type` `type` enum ('image', 'audio', 'video', 'other') COLLATE \"utf8mb4_0900_ai_ci\" NOT NULL");
        await queryRunner.query("ALTER TABLE `diary_resource` DROP COLUMN `name`");
    }

}
