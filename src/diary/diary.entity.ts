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

export enum Emotion {
  excellent = 'excellent',
  good = 'good',
  natural = 'natural',
  disappointed = 'disappointed',
  hate = 'hate',
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

  @Column({ length: 255, nullable: true })
  tag?: string;

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
  )
  user: User;

  @OneToMany(
    () => DiaryResource,
    resource => resource.diary,
    { cascade: true },
  )
  resources: DiaryResource[];
}
