import {MigrationInterface, QueryRunner} from "typeorm";

export class User1603013777164 implements MigrationInterface {
    name = 'User1603013777164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `sub` varchar(32) NOT NULL, `email` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `givenName` varchar(255) NOT NULL, `familyName` varchar(255) NOT NULL, `picture` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `user`");
    }

}
