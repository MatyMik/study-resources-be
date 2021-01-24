import { Injectable } from '@nestjs/common';
import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestError } from '../errors/bad-request-error';
import { PdfDto } from './dto/create-pdf-dto';
import { Pdf } from './pdf.entity';
import { PdfUpdateDto } from './dto/pdf-update-dto';

@Injectable()
export class PdfService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Pdf) private pdf: Repository<Pdf>,
  ) {}

  async getPdfUploadLink(fileName: string) {
    const bucketName = this.configService.get<string>('bucketName'); //process.env.BUCKET_NAME;
    const projectId = this.configService.get<string>('projectId'); //process.env.PROJECT_ID; //

    if (!fileName) {
      throw new BadRequestError('File name must be provided');
    }

    const storage = new Storage({ projectId });
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType: 'application/pdf',
    };

    const [url] = await storage
      .bucket(bucketName)
      .file(`1/${fileName}`)
      .getSignedUrl(options);
    return url;
  }

  async saveOnePdf(pdfData: PdfDto) {
    const newPdf: Pdf = Pdf.create();
    newPdf.url = pdfData.url;
    newPdf.fileName = pdfData.fileName;
    newPdf.numPages = pdfData.numPages;
    const [savedPdf] = await this.pdf.save<Pdf>([newPdf]);
    return savedPdf;
  }

  async updatePdf(pdf: Pdf, newPdfValues: PdfUpdateDto) {
    pdf.fileName = newPdfValues.fileName || pdf.fileName;
    pdf.numPages = newPdfValues.numPages || pdf.numPages;
    pdf.lastActive = newPdfValues.lastActive || pdf.lastActive;
    const [savedPdf] = await this.pdf.save<Pdf>([pdf]);
    return savedPdf;
  }

  async findPdfById(id: number) {
    const [pdf] = await this.pdf.find({ id });
    return pdf;
  }

  async deletePdf(pdfId: number) {
    await this.pdf.delete(pdfId);
  }
}
