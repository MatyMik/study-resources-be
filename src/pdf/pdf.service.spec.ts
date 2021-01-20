import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pdf } from './pdf.entity';

export type MockType<T> = {
  [P in keyof T]: jest.Mock<any>;
};

const mockedFile = {
  getSignedUrl: jest.fn(() => 'url'),
};

const mockedBucket = {
  file: jest.fn(() => mockedFile),
};

const mockedStorage = {
  bucket: jest.fn(() => mockedBucket),
};

jest.mock('@google-cloud/storage', () => {
  return {
    Storage: jest.fn(() => mockedStorage),
  };
});

const pdf = {
  url: 'asdf',
  fileName: 'asdf',
  numPages: 343,
};

describe('PdfService', () => {
  let service: PdfService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PdfService],
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
    }).compile();

    service = module.get<PdfService>(PdfService);
  });
  afterAll(async () => {
    module.close();
  });

  describe('Get one time google storage link', () => {
    it('should be defined', async () => {
      expect(service.getPdfUploadLink).toBeDefined();
    });

    it('should throw error if file name is not supplied', async () => {
      const fileName = 'pdf';
      try {
        await service.getPdfUploadLink(fileName);
      } catch (err) {
        expect(err.message).toEqual('File name must be provided');
      }
    });

    it('should return a google storage link', async () => {
      const fileName = 'pdf';
      const pdfDetails = await service.getPdfUploadLink(fileName);
      expect(pdfDetails).toBeDefined();
    });
  });

  describe('save pdf details to db', () => {
    it('should return the saved user', async () => {
      const savedPdf = await service.saveOnePdf(pdf);
      expect(savedPdf.id).toBeTruthy();
    });
  });
});
