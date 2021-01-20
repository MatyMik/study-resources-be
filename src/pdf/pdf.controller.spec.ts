import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pdf } from './pdf.entity';

describe('PdfController', () => {
  let controller;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [PdfController],
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
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
          keepConnectionAlive: false,
        }),
        TypeOrmModule.forFeature([Pdf]),
      ],
      providers: [PdfService],
    }).compile();
    controller = module.get<PdfController>(PdfController);
  });

  afterAll(async () => {
    module.close();
  });

  describe('Upload link generation', () => {
    it('should return an upload link', async () => {
      const result = await controller.getSingleUploadUrl('file');
      expect(typeof result.url).toEqual('string');
    });

    it('should throw error if no query params are given', async () => {
      await expect(controller.getSingleUploadUrl()).rejects.toThrow(
        'No filename was provided!',
      );
    });
  });

  describe('upload a pdf file', () => {
    it('should throw error if not all parameters are supplied', async () => {
      await expect(controller.savePdf()).rejects.toThrow('Not enough data!');
    });

    it('should save the pdf to the database and return it with an id', async () => {
      const result = await controller.savePdf({
        fileName: 'asd',
        url: 'asdf',
        numPages: 2,
      });
      expect(result.pdfDetails.id).toBeTruthy();
    });
  });
});
