import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Diary } from '../diary/diary.entity';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum Type {
  image = 'image',
  audio = 'audio',
  video = 'video',
  other = 'other',
}

@Entity({ name: 'diary_resource' })
export class DiaryResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  url: string;

  @Column({
    type: 'enum',
    enum: Type,
  })
  type: Type;

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
    () => Diary,
    diary => diary.resources,
  )
  diary: Diary;
}
