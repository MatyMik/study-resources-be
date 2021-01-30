import { Injectable } from '@nestjs/common';
import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestError } from '../errors/bad-request-error';
import { PdfDto } from './dto/create-pdf-dto';
import { Pdf } from './pdf.entity';
import { PdfUpdateDto } from './dto/pdf-update-dto';
import { Topic } from '../topics/topic.entity';
import { ActionTypes } from './dto/google-storage-action-enum';

@Injectable()
export class PdfService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Pdf) private pdf: Repository<Pdf>,
  ) {}

  async getPdfLink(
    title: string,
    userId: number,
    action: ActionTypes = ActionTypes.WRITE,
  ) {
    const bucketName = this.configService.get<string>('bucketName'); //process.env.BUCKET_NAME;
    const projectId = this.configService.get<string>('projectId'); //process.env.PROJECT_ID; //

    if (!title) {
      throw new BadRequestError('File name must be provided');
    }

    const storage = new Storage({ projectId });
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action,
      expires: Date.now() + 15 * 60 * 1000,
      contentType: 'application/pdf',
    };

    const [url] = await storage
      .bucket(bucketName)
      .file(`${userId}/${title}`)
      .getSignedUrl(options);
    return url;
  }

  async saveOnePdf(pdfData: PdfDto, topic: Topic) {
    const newPdf: Pdf = Pdf.create();
    newPdf.url = pdfData.url;
    newPdf.title = pdfData.title;
    newPdf.numPages = pdfData.numPages;
    newPdf.topic = topic;
    const [savedPdf] = await this.pdf.save<Pdf>([newPdf]);
    return savedPdf;
  }

  async updatePdf(pdf: Pdf, newPdfValues: PdfUpdateDto) {
    pdf.title = newPdfValues.title || pdf.title;
    pdf.lastPageRead = newPdfValues.lastPageRead || pdf.lastPageRead;
    pdf.lastActive = newPdfValues.lastActive || pdf.lastActive;
    pdf.archived = !!newPdfValues.archived;
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

  async findAllPdfs(
    topic: Topic,
    page: number,
    itemsPerPage: number,
    archived: boolean,
  ) {
    const limit = itemsPerPage;
    const offset = (page - 1) * itemsPerPage;
    return await this.pdf.find({
      where: { topic, archived },
      order: { lastActive: 'DESC' },
      skip: offset,
      take: limit,
    });
  }
}
