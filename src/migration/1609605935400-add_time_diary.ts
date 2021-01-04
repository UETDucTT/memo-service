import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTimeDiary1609605935400 implements MigrationInterface {
  name = 'addTimeDiary1609605935400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `diary` ADD `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP',
    );
    await queryRunner.query('UPDATE `diary` SET `time` = createdAt WHERE 1');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `diary` DROP COLUMN `time`');
  }
}
