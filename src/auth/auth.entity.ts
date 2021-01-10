import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { Expose, Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Diary } from '../diary/diary.entity';
import { Notification } from '../notification/notification.entity';
import { Tag } from 'src/tag/tag.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Expose()
  id: number;

  @Column({ length: 32, nullable: true })
  @ApiProperty()
  @Expose()
  sub?: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty()
  @Expose()
  username?: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty({ writeOnly: true })
  @Expose()
  @Exclude()
  password?: string;

  @Column({ length: 255 })
  @ApiProperty()
  @Expose()
  email: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty()
  @Expose()
  name?: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty()
  @Expose()
  givenName?: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty()
  @Expose()
  familyName: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty()
  @Expose()
  picture: string;

  @Column({ nullable: true })
  @ApiProperty()
  @Expose()
  gender?: string;

  @Column({ nullable: true })
  @ApiProperty()
  @Expose()
  birthday?: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @OneToMany(
    () => Diary,
    diary => diary.user,
    { cascade: true },
  )
  diaries: Diary[];

  @OneToMany(
    () => Tag,
    tag => tag.user,
    { cascade: true },
  )
  tags: Tag[];

  @OneToMany(
    () => Notification,
    notification => notification.user,
    { cascade: true },
  )
  notifications: Notification[];
}
