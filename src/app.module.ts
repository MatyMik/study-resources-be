import { Module } from '@nestjs/common';
import { PdfModule } from './pdf/pdf.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pdf } from './pdf/pdf.entity';
import { AuthenticationModule } from './authentication/authentication.module';
import { TopicsModule } from './topics/topics.module';
import { ArticleModule } from './article/article.module';
import { YoutubeModule } from './youtube/youtube.module';
import { Youtube } from './youtube/youtube.entity';
import { Article } from './article/article.entity';
import { User } from './authentication/user.entity';
import { Topic } from './topics/topic.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Pdf, Youtube, Article, User, Topic],
      autoLoadEntities: true,
      synchronize: true,
      keepConnectionAlive: true,
    }),
    PdfModule,
    AuthenticationModule,
    TopicsModule,
    ArticleModule,
    YoutubeModule,
  ],
})
export class AppModule {}
