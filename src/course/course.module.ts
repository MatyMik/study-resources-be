import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { TopicsService } from '../topics/topics.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { Video, Section, Course } from './entities';
import { Topic } from '../topics/topic.entity';
import { AuthenticationService } from '../authentication/authentication.service';
import { Youtube } from '../youtube/youtube.entity';
import { User } from '../authentication/user.entity';
import { Pdf } from '../pdf/pdf.entity';
import { Article } from '../article/article.entity';

@Module({
  providers: [CourseService, TopicsService, AuthenticationService],
  controllers: [CourseController],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Topic,
      Youtube,
      User,
      Article,
      Pdf,
      Video,
      Section,
      Course,
    ]),
  ],
})
export class CourseModule {}
