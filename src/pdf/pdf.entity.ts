import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { Topic } from '../topics/topic.entity';

@Entity()
export class Pdf extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  numPages: number;

  @Column({ default: 0 })
  lastPageRead: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  url: string;

  @ManyToOne(() => Topic, (topic) => topic.pdf, { onDelete: 'CASCADE' })
  topic: Topic;

  @Column({ type: 'bigint', default: Date.now() })
  lastActive: number;
}
