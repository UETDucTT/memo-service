import {MigrationInterface, QueryRunner} from "typeorm";

export class tagTable1609575809205 implements MigrationInterface {
    name = 'tagTable1609575809205'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `diary` CHANGE `tag` `tagId` varchar(255) COLLATE \"utf8mb4_0900_ai_ci\" NULL");
        await queryRunner.query("CREATE TABLE `tag` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `color` varchar(255) NOT NULL, `isDefault` tinyint NOT NULL DEFAULT 0, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `diary` DROP COLUMN `tagId`");
        await queryRunner.query("ALTER TABLE `diary` ADD `tagId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `tag` ADD CONSTRAINT `FK_d0dc39ff83e384b4a097f47d3f5` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `diary` ADD CONSTRAINT `FK_33ca9df2514f801679dd6da724d` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `diary` DROP FOREIGN KEY `FK_33ca9df2514f801679dd6da724d`");
        await queryRunner.query("ALTER TABLE `tag` DROP FOREIGN KEY `FK_d0dc39ff83e384b4a097f47d3f5`");
        await queryRunner.query("ALTER TABLE `diary` DROP COLUMN `tagId`");
        await queryRunner.query("ALTER TABLE `diary` ADD `tagId` varchar(255) COLLATE \"utf8mb4_0900_ai_ci\" NULL");
        await queryRunner.query("DROP TABLE `tag`");
        await queryRunner.query("ALTER TABLE `diary` CHANGE `tagId` `tag` varchar(255) COLLATE \"utf8mb4_0900_ai_ci\" NULL");
    }

}
