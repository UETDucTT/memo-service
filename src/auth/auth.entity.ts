import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Expose()
  id: number;

  @Column({ length: 32 })
  @ApiProperty()
  @Expose()
  sub: string;

  @Column({ length: 255 })
  @ApiProperty()
  @Expose()
  email: string;

  @Column({ length: 255 })
  @ApiProperty()
  @Expose()
  name: string;

  @Column({ length: 255 })
  @ApiProperty()
  @Expose()
  givenName: string;

  @Column({ length: 255 })
  @ApiProperty()
  @Expose()
  familyName: string;

  @Column({ length: 255 })
  @ApiProperty()
  @Expose()
  picture: string;
}
