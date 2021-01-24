import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { Topic } from '../topics/topic.entity';

@Entity()
export class Youtube extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  url: string;

  @ManyToOne(() => Topic, (topic) => topic.youtube, { onDelete: 'CASCADE' })
  topic: Topic;

  @Column({ type: 'bigint', default: Date.now() })
  lastActive: number;
}
