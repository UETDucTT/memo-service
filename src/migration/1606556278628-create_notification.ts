import {MigrationInterface, QueryRunner} from "typeorm";

export class createNotification1606556278628 implements MigrationInterface {
    name = 'createNotification1606556278628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `notification` (`id` varchar(36) NOT NULL, `data` json NOT NULL, `seen` tinyint NOT NULL DEFAULT 0, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `notification` ADD CONSTRAINT `FK_1ced25315eb974b73391fb1c81b` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `notification` DROP FOREIGN KEY `FK_1ced25315eb974b73391fb1c81b`");
        await queryRunner.query("DROP TABLE `notification`");
    }

}
