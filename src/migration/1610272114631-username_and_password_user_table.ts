import {MigrationInterface, QueryRunner} from "typeorm";

export class usernameAndPasswordUserTable1610272114631 implements MigrationInterface {
    name = 'usernameAndPasswordUserTable1610272114631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `username` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `password` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `sub` `sub` varchar(32) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `name` `name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `givenName` `givenName` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `familyName` `familyName` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `picture` `picture` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `picture` `picture` varchar(255) COLLATE \"utf8mb4_0900_ai_ci\" NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `familyName` `familyName` varchar(255) COLLATE \"utf8mb4_0900_ai_ci\" NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `givenName` `givenName` varchar(255) COLLATE \"utf8mb4_0900_ai_ci\" NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `name` `name` varchar(255) COLLATE \"utf8mb4_0900_ai_ci\" NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `sub` `sub` varchar(32) COLLATE \"utf8mb4_0900_ai_ci\" NOT NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `password`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `username`");
    }

}
