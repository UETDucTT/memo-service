import {MigrationInterface, QueryRunner} from "typeorm";

export class addStatusDiary1604839596739 implements MigrationInterface {
    name = 'addStatusDiary1604839596739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `diary` ADD `status` enum ('public', 'private') NOT NULL DEFAULT 'private'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `diary` DROP COLUMN `status`");
    }

}
