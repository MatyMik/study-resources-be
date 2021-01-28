import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Pdf } from './pdf.entity';
import { Topic } from '../topics/topic.entity';
import { User } from '../authentication/user.entity';
import {
  saveOnePdfToTopic,
  createOneTopic,
  saveMultiplePdfsToTopic,
} from '../tests/test-helpers';
import { Article } from '../article/article.entity';
import { Youtube } from '../youtube/youtube.entity';
import { TopicsService } from '../topics/topics.service';
import { AuthenticationService } from '../authentication/authentication.service';

describe('PdfController', () => {
  let controller;
  let module: TestingModule;
  let repo;
  let service;

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
          entities: [Pdf, Topic, User, Article, Youtube],
          autoLoadEntities: true,
          synchronize: true,
          keepConnectionAlive: false,
        }),
        TypeOrmModule.forFeature([Pdf, Topic, User]),
      ],
      providers: [PdfService, TopicsService, AuthenticationService],
    }).compile();
    controller = module.get<PdfController>(PdfController);
    service = module.get<PdfService>(PdfService);
    repo = module.get(getRepositoryToken(Topic));
  });

  afterAll(async () => {
    module.close();
  });

  afterEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
    await repo.query('TRUNCATE TABLE public.topic CASCADE;');
    await repo.query('TRUNCATE TABLE public.pdf CASCADE;');
  });

  beforeEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
    await repo.query('TRUNCATE TABLE public.topic CASCADE;');
    await repo.query('TRUNCATE TABLE public.pdf CASCADE;');
  });

  describe('Upload link generation', () => {
    it('should throw an error if user is not found', async () => {
      const topic = await createOneTopic(repo);
      expect(
        controller.getSingleUploadUrl('file', topic.userId + 100),
      ).rejects.toThrow('User not found!');
    });
    it('should return an upload link', async () => {
      const topic = await createOneTopic(repo);
      const result = await controller.getSingleUploadUrl('file', topic.userId);
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
        title: 'asd',
        url: 'asdf',
        numPages: 2,
      });
      expect(result.pdfDetails.id).toBeTruthy();
    });
  });

  describe('update a single pdf', () => {
    it('should throw error if pdf does not exist', async () => {
      const [savedTopic, savedPdf] = await saveOnePdfToTopic(repo);
      const originalPdf = { ...savedPdf };
      const pdfUpdate = { lastActive: Date.now() };
      expect(
        controller.updatePdf(savedPdf.id + 100, pdfUpdate),
      ).rejects.toThrow('No pdf found to update!');
    });
    it('should update a pdf', async () => {
      const [savedTopic, savedPdf] = await saveOnePdfToTopic(repo);
      const originalPdf = { ...savedPdf };
      const pdfUpdate = { lastActive: Date.now() };
      const updatedPdf = await controller.updatePdf(savedPdf.id, pdfUpdate);
      expect(updatedPdf.lastActive).not.toEqual(originalPdf.lastActive);
    });
  });

  describe('delete a single pdf', () => {
    it('should throw error if pdf does not exist', async () => {
      const [savedTopic, savedPdf] = await saveOnePdfToTopic(repo);
      const originalPdf = { ...savedPdf };
      const pdfUpdate = { lastActive: Date.now() };
      expect(
        controller.deletePdf(savedPdf.id + 100, pdfUpdate),
      ).rejects.toThrow('No pdf found to update!');
    });
    it('should update a pdf', async () => {
      const [savedTopic, savedPdf] = await saveOnePdfToTopic(repo);
      const originalPdf = { ...savedPdf };
      const pdfUpdate = { lastActive: Date.now() };
      await controller.deletePdf(savedPdf.id, pdfUpdate);
      const deletedPdf = await service.findPdfById(savedPdf.id);
      expect(deletedPdf).toBeFalsy();
    });
  });

  describe('get all books', () => {
    it('should throw error if topic is not found', async () => {
      const topic = await createOneTopic(repo);
      expect(controller.getAllPdfs(topic.id + 100, 1, 2)).rejects.toThrow(
        'Topic not found!',
      );
    });
    it('should return the selected pdfs', async () => {
      const [topic, pdfs] = await saveMultiplePdfsToTopic(repo);
      const foundPdfs = await controller.getAllPdfs(topic.id, 1, 2);
      expect(pdfs.slice(0, 2)).toEqual(foundPdfs);
    });
  });
});
