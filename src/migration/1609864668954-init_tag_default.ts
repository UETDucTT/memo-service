import { Tag } from 'src/tag/tag.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '../auth/auth.entity';

export class initTagDefault1609864668954 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = await queryRunner.manager.find(User);
    for (let i = 0; i < users.length; i++) {
      const allTags = await queryRunner.manager.find(Tag, {
        where: { user: { id: users[i].id } },
      });
      if (!allTags.length) {
        const loveTag = new Tag();
        loveTag.name = 'Tình yêu';
        loveTag.isDefault = true;
        loveTag.color = '#FF0080';
        loveTag.user = users[i];

        const workTag = new Tag();
        workTag.name = 'Công việc';
        workTag.isDefault = true;
        workTag.color = '#009EFF';
        workTag.user = users[i];

        const studyTag = new Tag();
        studyTag.name = 'Học tập';
        studyTag.isDefault = true;
        studyTag.color = '#B900FF';
        studyTag.user = users[i];

        const familyTag = new Tag();
        familyTag.name = 'Gia đình';
        familyTag.isDefault = true;
        familyTag.color = '#FF1300';
        familyTag.user = users[i];

        const travelTag = new Tag();
        travelTag.name = 'Chuyến đi';
        travelTag.isDefault = true;
        travelTag.color = '#45CF09';
        travelTag.user = users[i];

        await queryRunner.manager.save(Tag, [
          studyTag,
          workTag,
          loveTag,
          familyTag,
          travelTag,
        ]);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tags = await queryRunner.manager.find(Tag, {
      where: [
        { name: 'Công việc', isDefault: true, color: '#009EFF' },
        { name: 'Gia đình', isDefault: true, color: '#FF1300' },
        { name: 'Học tập', isDefault: true, color: '#B900FF' },
        { name: 'Chuyến đi', isDefault: true, color: '#45CF09' },
        { name: 'Tình yêu', isDefault: true, color: '#FF0080' },
      ],
    });
    await queryRunner.manager.remove(tags);
  }
}
