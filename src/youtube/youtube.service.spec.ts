import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Article } from '../article/article.entity';
import { Topic } from '../topics/topic.entity';
import { User } from '../authentication/user.entity';
import { Pdf } from '../pdf/pdf.entity';
import { Youtube } from './youtube.entity';
import {
  saveOneYoutubeLinkToTopic,
  saveMultipleYoutubeLinksToTopic,
  createOneTopic,
} from '../tests/test-helpers';
import { url, youtubeTitle } from '../tests/test-data';
import { TopicsService } from '../topics/topics.service';

describe('ArticleController', () => {
  let controller;
  let module: TestingModule;
  let repo;
  let service;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [YoutubeController],
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          entities: [Article, Topic, User, Pdf, Youtube],
          autoLoadEntities: true,
          synchronize: true,
          keepConnectionAlive: false,
        }),
        TypeOrmModule.forFeature([Article, Topic, User, Pdf, Youtube]),
      ],
      providers: [YoutubeService, TopicsService],
    }).compile();
    controller = module.get<YoutubeController>(YoutubeController);
    service = module.get<YoutubeService>(YoutubeService);
    repo = module.get(getRepositoryToken(Topic));
  });

  afterAll(async () => {
    module.close();
  });

  afterEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
    await repo.query('TRUNCATE TABLE public.topic CASCADE;');
    await repo.query('TRUNCATE TABLE public.youtube CASCADE;');
  });

  beforeEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
    await repo.query('TRUNCATE TABLE public.topic CASCADE;');
    await repo.query('TRUNCATE TABLE public.youtube CASCADE;');
  });

  describe('save youtube link details to db', () => {
    it('should return the saved youtube link', async () => {
      const savedTopic = await createOneTopic(repo);
      const youtubeData = { title: youtubeTitle, url };
      const savedYoutubeLink = await service.saveOneYoutubeLink(
        youtubeData,
        savedTopic,
      );
      expect(savedYoutubeLink.id).toBeTruthy();
    });
  });
  describe('update youtube link by id', () => {
    it('should update the saved youtube link given the id', async () => {
      const [topic, youtubeLink] = await saveOneYoutubeLinkToTopic(repo);
      const originalYoutubeLink = { ...youtubeLink };
      const updateYoutubeLink = { lastActive: Date.now() };
      const updatedYoutubeLink = await service.updateYoutubeLink(
        youtubeLink,
        updateYoutubeLink,
      );
      expect(updatedYoutubeLink.lastActive).not.toEqual(
        originalYoutubeLink.lastActive,
      );
    });
  });
  describe('find youtube link by id', () => {
    it('should return the saved youtube link given the id', async () => {
      const [topic, youtubeLink] = await saveOneYoutubeLinkToTopic(repo);
      const savedYoutubeLink = await service.findYoutubeLinkById(
        youtubeLink.id,
      );
      expect(savedYoutubeLink).toEqual(youtubeLink);
    });
  });
  describe('delete youtube link by id', () => {
    it('should delete the saved youtube link given the id', async () => {
      const [topic, youtubeLink] = await saveOneYoutubeLinkToTopic(repo);
      await service.deleteYoutubeLink(youtubeLink.id);
      const deletedYoutubeLink = await service.findYoutubeLinkById(
        youtubeLink.id,
      );
      expect(deletedYoutubeLink).toBeFalsy();
    });
  });

  describe('find all youtube links in topic', () => {
    it('should return all the saved youtube links in given topic', async () => {
      const [topic, youtubeLinks] = await saveMultipleYoutubeLinksToTopic(repo);
      const savedYoutubeLinks = await service.findAllYoutubeLinksInTopic(
        topic,
        1,
        2,
        false,
      );
      expect(savedYoutubeLinks).toEqual(youtubeLinks.slice(0, 2));
    });
  });
});
