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

@Controller('pdf')
export class PdfController {
  constructor(private pdfService: PdfService) {}
  @Get('uploadurl')
  async getSingleUploadUrl(@Query('fileName') fileName: string) {
    if (!fileName) {
      throw new BadRequestError('No filename was provided!');
    }

    const url = await this.pdfService.getPdfUploadLink(fileName);
    return { url };
  }

  @Post('add')
  async savePdf(@Body('pdfDetails') pdfData: PdfDto) {
    if (!pdfData) throw new BadRequestError('Not enough data!');
    const { fileName, url, numPages } = pdfData;
    if (!fileName || !url || !numPages)
      throw new BadRequestError('Not enough data!');

    const pdfDetails = await this.pdfService.saveOnePdf(pdfData);
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
}
