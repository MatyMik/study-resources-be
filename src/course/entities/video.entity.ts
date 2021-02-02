import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { Section } from './section.entity';

@Entity()
export class Video extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  url: string;

  @ManyToOne(() => Section, (section) => section.videos)
  section: Section;

  @Column({ nullable: false })
  order: number;

  @Column({ nullable: true })
  duration: number;

  @Column({ default: false })
  watched: boolean;

  @Column({ default: 0 })
  minutesWatched: number;
}
