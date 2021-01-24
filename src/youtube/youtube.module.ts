import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { Topic } from '../topics/topic.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeController } from './youtube.controller';
import { Youtube } from './youtube.entity';
import { TopicsService } from '../topics/topics.service';
import { Article } from '../article/article.entity';
import { Pdf } from '../pdf/pdf.entity';
import { User } from '../authentication/user.entity';

@Module({
  controllers: [YoutubeController],
  providers: [YoutubeService, TopicsService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Youtube, Topic, Article, Pdf, User]),
  ],
  exports: [YoutubeService],
})
export class YoutubeModule {}
