import { MigrationInterface, QueryRunner } from 'typeorm';

export class diaryTagManyMany1612717147768 implements MigrationInterface {
  name = 'diaryTagManyMany1612717147768';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `diary_tag` (`diaryId` varchar(36) NOT NULL, `tagId` varchar(36) NOT NULL, INDEX `IDX_fd5d6decc22d29e040b39ad165` (`diaryId`), INDEX `IDX_f85caf2975074e572a6cfde86f` (`tagId`), PRIMARY KEY (`diaryId`, `tagId`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `diary_tag` CHANGE COLUMN `diaryId` `diaryId` VARCHAR(36) CHARACTER SET utf8mb4',
    );
    await queryRunner.query(
      'ALTER TABLE `diary_tag` CHANGE COLUMN `tagId` `tagId` VARCHAR(36) CHARACTER SET utf8mb4',
    );
    await queryRunner.query(
      'ALTER TABLE `diary_tag` ADD CONSTRAINT `FK_fd5d6decc22d29e040b39ad1652` FOREIGN KEY (`diaryId`) REFERENCES `diary`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `diary_tag` ADD CONSTRAINT `FK_f85caf2975074e572a6cfde86f6` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `diary_tag` DROP FOREIGN KEY `FK_f85caf2975074e572a6cfde86f6`',
    );
    await queryRunner.query(
      'ALTER TABLE `diary_tag` DROP FOREIGN KEY `FK_fd5d6decc22d29e040b39ad1652`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_f85caf2975074e572a6cfde86f` ON `diary_tag`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_fd5d6decc22d29e040b39ad165` ON `diary_tag`',
    );
    await queryRunner.query('DROP TABLE `diary_tag`');
  }
}
