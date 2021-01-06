import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPreviewLink1609951183365 implements MigrationInterface {
  name = 'addPreviewLink1609951183365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `link` (`id` varchar(36) NOT NULL, `url` text NOT NULL, `image` text NULL, `title` text NULL, `description` text NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `diaryId` varchar(36) NULL, PRIMARY KEY (`id`)) COLLATE "utf8mb4_0900_ai_ci" ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `link` ADD CONSTRAINT `FK_6ef8a5731999c136796192417d0` FOREIGN KEY (`diaryId`) REFERENCES `diary`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `link` DROP FOREIGN KEY `FK_6ef8a5731999c136796192417d0`',
    );
    await queryRunner.query('DROP TABLE `link`');
  }
}
