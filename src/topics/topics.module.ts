import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './topic.entity';
import { AuthenticationService } from '../authentication/authentication.service';
import { Youtube } from '../youtube/youtube.entity';
import { User } from '../authentication/user.entity';
import { Pdf } from '../pdf/pdf.entity';
import { Article } from '../article/article.entity';

@Module({
  providers: [TopicsService, AuthenticationService],
  controllers: [TopicsController],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Topic, Youtube, User, Article, Pdf]),
  ],
  exports: [TopicsService],
})
export class TopicsModule {}
