import {MigrationInterface, QueryRunner} from "typeorm";

export class updateUserAndCreateDiaryResource1603206576531 implements MigrationInterface {
    name = 'updateUserAndCreateDiaryResource1603206576531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `diary_resource` (`id` varchar(36) NOT NULL, `url` text NOT NULL, `type` enum ('image', 'audio', 'video', 'other') NOT NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `diaryId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `diary` (`id` varchar(36) NOT NULL, `title` varchar(255) NOT NULL, `content` text NULL, `emotion` enum ('excellent', 'good', 'natural', 'disappointed', 'hate') NULL, `tag` varchar(255) NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` ADD `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `user` ADD `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `diary_resource` ADD CONSTRAINT `FK_7054da97c67b63b020faca48756` FOREIGN KEY (`diaryId`) REFERENCES `diary`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `diary` ADD CONSTRAINT `FK_bda48d3f2d272ca20f3aa612e5c` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `diary` DROP FOREIGN KEY `FK_bda48d3f2d272ca20f3aa612e5c`");
        await queryRunner.query("ALTER TABLE `diary_resource` DROP FOREIGN KEY `FK_7054da97c67b63b020faca48756`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `updatedAt`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `createdAt`");
        await queryRunner.query("DROP TABLE `diary`");
        await queryRunner.query("DROP TABLE `diary_resource`");
    }

}
