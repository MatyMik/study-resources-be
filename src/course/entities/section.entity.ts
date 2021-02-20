import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Course } from './course.entity';
import { Video } from './video.entity';

@Entity()
export class Section extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @ManyToOne(() => Course, (course) => course.sections)
  course: Course;

  @Column({ nullable: false })
  order: number;

  @Column({ nullable: true })
  totalVideoLength: string;

  @OneToMany(() => Video, (video) => video.section, {
    cascade: ['insert', 'update'], // <= here
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  videos: Video[];
}
