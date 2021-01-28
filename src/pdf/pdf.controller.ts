import {
  Body,
  Controller,
  Get,
  Query,
  Post,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { BadRequestError } from '../errors/bad-request-error';
import { PdfDto } from './dto/create-pdf-dto';
import { PdfService } from './pdf.service';
import { PdfUpdateDto } from './dto/pdf-update-dto';
import { NotFoundError } from '../errors/not-found-error';
import { AuthenticationService } from '../authentication/authentication.service';
import { TopicsService } from '../topics/topics.service';

@Controller('pdf')
export class PdfController {
  constructor(
    private pdfService: PdfService,
    private user: AuthenticationService,
    private topic: TopicsService,
  ) {}
  @Get('uploadurl')
  async getSingleUploadUrl(
    @Query('title') title: string,
    @Query('userId') userId: number,
  ) {
    if (!title) {
      throw new BadRequestError('No filename was provided!');
    }
    const user = await this.user.findById(userId);
    if (!user) throw new NotFoundError('User not found!');
    const url = await this.pdfService.getPdfUploadLink(title, userId);
    return { url };
  }

  @Post('add')
  async savePdf(@Body('pdfDetails') pdfData: PdfDto) {
    if (!pdfData) throw new BadRequestError('Not enough data!');
    const { title, url, numPages } = pdfData;
    if (!title || !url || !numPages)
      throw new BadRequestError('Not enough data!');
    const topic = await this.topic.findTopicById(pdfData.topicId);
    const pdfDetails = await this.pdfService.saveOnePdf(pdfData, topic);
    return { pdfDetails };
  }

  @Put('update/:pdfId')
  async updatePdf(@Param('pdfId') pdfId: number, pdf: PdfUpdateDto) {
    const foundPdf = await this.pdfService.findPdfById(pdfId);
    if (!foundPdf) throw new NotFoundError('No pdf found to update!');
    return await this.pdfService.updatePdf(foundPdf, pdf);
  }

  @Delete('delete/:pdfId')
  async deletePdf(@Param('pdfId') pdfId: number) {
    const foundPdf = await this.pdfService.findPdfById(pdfId);
    if (!foundPdf) throw new NotFoundError('No pdf found to update!');
    return await this.pdfService.deletePdf(pdfId);
  }
  @Get(':topicId')
  async getAllPdfs(
    @Param('topicId') topicId: number,
    @Query('page') page: number,
    @Query('itemsPerPage') itemsPerPage: number,
  ) {
    const topic = await this.topic.findTopicById(topicId);
    if (!topic) throw new NotFoundError('Topic not found!');
    return await this.pdfService.findAllPdfs(topic, page, itemsPerPage);
  }
}
