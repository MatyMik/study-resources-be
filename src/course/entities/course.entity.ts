import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Topic } from '../../topics/topic.entity';
import { Section } from './section.entity';

@Entity()
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @ManyToOne(() => Topic, (topic) => topic.articles, {
    cascade: ['insert', 'update'], // <= here
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  topic: Topic;

  @Column({ type: 'bigint', default: Date.now() })
  lastActive: number;

  @Column({ default: 0 })
  lastWatched: number;

  @Column({ default: false })
  archived: boolean;

  @OneToMany(() => Section, (section) => section.course, {
    cascade: ['insert', 'update'], // <= here
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  sections: Section[];

  @Column({ default: 1 })
  totalItems: number;
}
