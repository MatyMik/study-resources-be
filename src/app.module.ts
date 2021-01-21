import { Module } from '@nestjs/common';
import { PdfModule } from './pdf/pdf.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pdf } from './pdf/pdf.entity';
import { AuthenticationModule } from './authentication/authentication.module';
import { TopicsController } from './topics/topics.controller';
import { TopicsModule } from './topics/topics.module';

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
      entities: [Pdf],
      autoLoadEntities: true,
      synchronize: true,
      keepConnectionAlive: true,
    }),
    PdfModule,
    AuthenticationModule,
    TopicsModule,
  ],
  controllers: [TopicsController],
  providers: [],
})
export class AppModule {}
