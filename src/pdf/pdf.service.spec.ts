import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Pdf } from './pdf.entity';
import { Topic } from '../topics/topic.entity';
import { User } from '../authentication/user.entity';
import { saveOnePdfToTopic, createOneTopic } from '../tests/test-helpers';
import { Article } from '../article/article.entity';
import { Youtube } from '../youtube/youtube.entity';
import { AuthenticationService } from '../authentication/authentication.service';
import { TopicsService } from '../topics/topics.service';

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
  title: 'asdf',
  numPages: 343,
};

describe('PdfService', () => {
  let service: PdfService;
  let module: TestingModule;
  let repo;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PdfService, AuthenticationService, TopicsService],
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          entities: [Pdf, Topic, User, Article, Youtube],
          autoLoadEntities: true,
          synchronize: true,
          keepConnectionAlive: false,
        }),
        TypeOrmModule.forFeature([Pdf, Topic, User]),
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
    repo = module.get(getRepositoryToken(Topic));
  });
  afterAll(async () => {
    module.close();
  });

  describe('Get one time google storage link', () => {
    it('should be defined', async () => {
      expect(service.getPdfUploadLink).toBeDefined();
    });

    it('should throw error if file name is not supplied', async () => {
      const topic = await createOneTopic(repo);
      const title = 'pdf';
      expect(service.getPdfUploadLink(undefined, undefined)).rejects.toThrow(
        'File name must be provided',
      );
    });

    it('should return a google storage link', async () => {
      const topic = await createOneTopic(repo);
      const title = 'pdf';
      const pdfDetails = await service.getPdfUploadLink(title, topic.userId);
      expect(pdfDetails).toBeDefined();
    });
  });

  describe('save pdf details to db', () => {
    it('should return the saved user', async () => {
      const topic = await createOneTopic(repo);
      const pdfData = { ...pdf, topicId: topic.id };
      const savedPdf = await service.saveOnePdf(pdfData, topic);
      expect(savedPdf.id).toBeTruthy();
    });
  });
  describe('update pdf by id', () => {
    it('should update the saved pdf given the id', async () => {
      const [topic, pdf] = await saveOnePdfToTopic(repo);
      const originalPdf = { ...pdf };
      const updatePdf = { lastActive: Date.now() };
      const updatedPdf = await service.updatePdf(pdf, updatePdf);
      expect(updatedPdf.lastActive).not.toEqual(originalPdf.lastActive);
    });
  });
  describe('find pdf by id', () => {
    it('should return the saved pdf given the id', async () => {
      const [topic, pdf] = await saveOnePdfToTopic(repo);
      const savedPdf = await service.findPdfById(pdf.id);
      expect(savedPdf).not.toEqual(pdf);
    });
  });
  describe('delete pdf by id', () => {
    it('should delete the saved pdf given the id', async () => {
      const [topic, pdf] = await saveOnePdfToTopic(repo);
      await service.deletePdf(pdf.id);
      const deletedPdf = await service.findPdfById(pdf.id);
      expect(deletedPdf).toBeFalsy();
    });
  });
  describe('find all pdfs of a topic', () => {
    it('should return all the saved pdfs of a given topic', async () => {
      const [topic, pdf] = await saveOnePdfToTopic(repo);
      const savedPdfs = await service.findAllPdfs(topic, 1, 2);
      expect(savedPdfs.slice(0, 2)).not.toEqual(pdf);
    });
  });
});
