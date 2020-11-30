import {MigrationInterface, QueryRunner} from "typeorm";

export class updateGenderAndBirthday1606755205619 implements MigrationInterface {
    name = 'updateGenderAndBirthday1606755205619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `gender` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `birthday` datetime NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `birthday`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `gender`");
    }

}
