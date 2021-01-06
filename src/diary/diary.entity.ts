import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../auth/auth.entity';
import { DiaryResource } from '../resource/resource.entity';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Tag } from 'src/tag/tag.entity';
import { Link } from 'src/link-preview/link-preview.entity';

export enum Emotion {
  excellent = 'excellent',
  good = 'good',
  natural = 'natural',
  disappointed = 'disappointed',
  hate = 'hate',
}

export enum Status {
  public = 'public',
  private = 'private',
}

@Entity({ name: 'diary' })
export class Diary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({
    type: 'enum',
    enum: Emotion,
    nullable: true,
  })
  emotion?: Emotion;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.private,
  })
  status: Status;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  time: Date;

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

  @ManyToOne(
    () => User,
    user => user.diaries,
    { onDelete: 'CASCADE' },
  )
  user: User;

  @OneToMany(
    () => DiaryResource,
    resource => resource.diary,
    { cascade: true },
  )
  resources: DiaryResource[];

  @OneToMany(
    () => Link,
    link => link.diary,
    { cascade: true },
  )
  links: Link[];

  @ManyToOne(
    () => Tag,
    tag => tag.diaries,
    { onDelete: 'SET NULL' },
  )
  tag: Tag;
}
