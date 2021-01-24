import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { Topic } from '../topics/topic.entity';
import { User } from '../authentication/user.entity';
import { Pdf } from '../pdf/pdf.entity';
import { TopicsService } from '../topics/topics.service';

@Module({
  controllers: [ArticleController],
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Article, Topic, User, Pdf],
      autoLoadEntities: true,
      synchronize: true,
      keepConnectionAlive: false,
    }),
    TypeOrmModule.forFeature([Article, Topic, User, Pdf]),
  ],
  providers: [ArticleService, TopicsService],
})
export class ArticleModule {}
