import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pdf } from './pdf.entity';
import { Topic } from '../topics/topic.entity';

@Module({
  controllers: [PdfController],
  providers: [PdfService, ConfigService],
  imports: [ConfigModule, TypeOrmModule.forFeature([Pdf, Topic])],
  exports: [PdfService],
})
export class PdfModule {}
