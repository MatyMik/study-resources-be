import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../authentication/user.entity';
import { Pdf } from '../pdf/pdf.entity';
import { Article } from '../article/article.entity';
import { Youtube } from '../youtube/youtube.entity';

@Entity()
export class Topic extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @ManyToOne(() => User, (user) => user.topic, { cascade: true })
  user: User;

  @Column({ type: 'bigint', default: Date.now() })
  lastActive: number;

  @OneToMany(() => Article, (article) => article.topic)
  articles: Article[];

  @OneToMany(() => Pdf, (pdf) => pdf.topic)
  pdf: Pdf[];

  // @OneToMany(() => Udemy, (article) => article.topic)
  // udemy: Udemy[];

  @OneToMany(() => Youtube, (youtube) => youtube.topic)
  youtube: Youtube[];
}
