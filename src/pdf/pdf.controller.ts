import { Body, Controller, Get, Query, Post } from '@nestjs/common';
import { BadRequestError } from '../errors/bad-request-error';
import { PdfDto } from './dto/create-pdf-dto';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private pdfService: PdfService) {}
  @Get('')
  async getSingleUploadUrl(@Query('fileName') fileName: string) {
    if (!fileName) {
      throw new BadRequestError('No filename was provided!');
    }

    const url = await this.pdfService.getPdfUploadLink(fileName);
    return { url };
  }

  @Post('')
  async savePdf(@Body('pdfDetails') pdfData: PdfDto) {
    if (!pdfData) throw new BadRequestError('Not enough data!');
    const { fileName, url, numPages } = pdfData;
    if (!fileName || !url || !numPages)
      throw new BadRequestError('Not enough data!');

    const pdfDetails = await this.pdfService.saveOnePdf(pdfData);
    return { pdfDetails };
  }
}
