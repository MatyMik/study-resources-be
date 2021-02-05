import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestError } from '../errors/bad-request-error';
import { PdfDto } from './dto/create-pdf-dto';
import { Pdf } from './pdf.entity';
import { PdfUpdateDto } from './dto/pdf-update-dto';
import { Topic } from '../topics/topic.entity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class PdfService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Pdf) private pdf: Repository<Pdf>,
  ) {}

  async getAWSLink(title: string, userId: number) {
    const REGION = 'eu-central-1'; // e.g., "us-east-1"

    const bucketName = process.env.S3_BUCKET_NAME;

    const objectParams = {
      Bucket: bucketName,
      Key: `${userId}/${title}`,
    };

    // Create an S3 client service object
    const s3Client = new S3Client({ region: REGION });
    const command = new PutObjectCommand(objectParams);

    // Create the presigned URL.
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

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

  async count(topicId: number, archived: boolean) {
    const [{ count }] = await this.pdf.query(
      `SELECT COUNT(id) AS count FROM public.pdf WHERE "topicId" = ${topicId} AND archived=${archived}`,
    );
    return count;
  }
}
