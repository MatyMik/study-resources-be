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

describe('YoutubeController', () => {
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
          synchronize: false,
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

  describe('get all youtube links listed', () => {
    it('should throw error if topic does not exist', async () => {
      const [savedTopic, savedYoutubeLink] = await saveOneYoutubeLinkToTopic(
        repo,
      );
      expect(
        controller.findAllYoutubeLinks(savedTopic.id + 100, 1, 2),
      ).rejects.toThrow('No topic found!');
    });
    it('should return all youtube in a topic', async () => {
      const [
        savedTopic,
        savedYoutubeLinks,
      ] = await saveMultipleYoutubeLinksToTopic(repo);
      const foundYoutubeLinks = await controller.findAllYoutubeLinks(
        savedTopic.id,
        1,
        2,
      );
      expect(foundYoutubeLinks.resources).toEqual(
        savedYoutubeLinks.slice(0, 2),
      );
    });
  });

  describe('get one youtube listed', () => {
    it('should return the youtube with given id', async () => {
      const [savedTopic, savedYoutubeLink] = await saveOneYoutubeLinkToTopic(
        repo,
      );
      const foundYoutubeLink = await controller.findOneYoutubeLink(
        savedYoutubeLink.id,
      );
      expect(foundYoutubeLink).toEqual(savedYoutubeLink);
    });
  });

  describe('save an youtube link', () => {
    it('should throw error if not all parameters are supplied', async () => {
      await expect(controller.saveYoutubeLink()).rejects.toThrow(
        'Not enough data!',
      );
    });

    it('should throw error if topicId is wrong', async () => {
      const topic = await createOneTopic(repo);
      const youtubeLinkDetails = {
        title: youtubeTitle,
        url,
        topicId: topic.id + 100,
      };
      await expect(
        controller.saveYoutubeLink(youtubeLinkDetails),
      ).rejects.toThrow('Topic does not exist!');
    });

    it('should save the youtube link to the database and return it with an id', async () => {
      const topic = await createOneTopic(repo);
      const youtubeDetails = {
        title: youtubeTitle,
        url,
        topicId: topic.id,
      };
      const result = await controller.saveYoutubeLink(youtubeDetails);
      expect(result.youtubeDetails.id).toBeTruthy();
    });
  });

  describe('update a single youtube', () => {
    it('should throw error if youtube does not exist', async () => {
      const [savedTopic, savedYoutubeLink] = await saveOneYoutubeLinkToTopic(
        repo,
      );
      const originalYoutubeLink = { ...savedYoutubeLink };
      const youtubeUpdate = { lastActive: Date.now() };
      expect(
        controller.updateYoutubeLink(savedYoutubeLink.id + 100, youtubeUpdate),
      ).rejects.toThrow('No youtube link found to update!');
    });
    it('should update a youtube', async () => {
      const [savedTopic, savedYoutubeLink] = await saveOneYoutubeLinkToTopic(
        repo,
      );
      const originalYoutubeLink = { ...savedYoutubeLink };
      const youtubeUpdate = { lastActive: Date.now() };
      const updatedYoutubeLink = await controller.updateYoutubeLink(
        savedYoutubeLink.id,
        youtubeUpdate,
      );
      expect(updatedYoutubeLink.lastActive).not.toEqual(
        originalYoutubeLink.lastActive,
      );
    });
  });

  describe('delete a single youtube link', () => {
    it('should throw error if youtube link does not exist', async () => {
      const [savedTopic, savedYoutubeLink] = await saveOneYoutubeLinkToTopic(
        repo,
      );
      const originalYoutubeLink = { ...savedYoutubeLink };
      const youtubeLinkUpdate = { lastActive: Date.now() };
      expect(
        controller.deleteYoutubeLink(
          savedYoutubeLink.id + 100,
          youtubeLinkUpdate,
        ),
      ).rejects.toThrow('No youtube link found to update!');
    });
    it('should update a youtube link', async () => {
      const [savedTopic, savedYoutubeLink] = await saveOneYoutubeLinkToTopic(
        repo,
      );
      const originalYoutubeLink = { ...savedYoutubeLink };
      const youtubeUpdate = { lastActive: Date.now() };
      await controller.deleteYoutubeLink(savedYoutubeLink.id, youtubeUpdate);
      const deletedYoutubeLink = await service.findYoutubeLinkById(
        savedYoutubeLink.id,
      );
      expect(deletedYoutubeLink).toBeFalsy();
    });
  });
});
