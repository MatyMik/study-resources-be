import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pdf } from './pdf.entity';
import { Topic } from '../topics/topic.entity';
import { AuthenticationService } from '../authentication/authentication.service';
import { User } from '../authentication/user.entity';
import { Article } from '../article/article.entity';
import { Youtube } from '../youtube/youtube.entity';
import { TopicsService } from '../topics/topics.service';

@Module({
  controllers: [PdfController],
  providers: [PdfService, ConfigService, AuthenticationService, TopicsService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Pdf, Topic, User, Article, Youtube]),
  ],
  exports: [PdfService],
})
export class PdfModule {}
