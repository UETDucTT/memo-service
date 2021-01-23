import { MigrationInterface, QueryRunner } from 'typeorm';

export class diaryShare1611415406596 implements MigrationInterface {
  name = 'diaryShare1611415406596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `diary_share` (`id` varchar(36) NOT NULL, `email` varchar(255) NOT NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `diaryId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `diary_share` CHANGE COLUMN `diaryId` `diaryId` VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `diary_share` ADD CONSTRAINT `FK_919f9f620c1820dc9bf2e465217` FOREIGN KEY (`diaryId`) REFERENCES `diary`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `diary_share` DROP FOREIGN KEY `FK_919f9f620c1820dc9bf2e465217`',
    );
    await queryRunner.query('DROP TABLE `diary_share`');
  }
}
