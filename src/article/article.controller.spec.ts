import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { Topic } from '../topics/topic.entity';
import { User } from '../authentication/user.entity';
import { Pdf } from '../pdf/pdf.entity';
import { Youtube } from '../youtube/youtube.entity';
import {
  saveOneArticleToTopic,
  saveMultipleArticlesToTopic,
  createOneTopic,
} from '../tests/test-helpers';
import { articleTitle, url } from '../tests/test-data';
import { TopicsService } from '../topics/topics.service';

describe('ArticleController', () => {
  let controller;
  let module: TestingModule;
  let repo;
  let service;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ArticleController],
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          entities: [Article, Topic, Youtube, User, Pdf],
          autoLoadEntities: true,
          synchronize: true,
          keepConnectionAlive: false,
        }),
        TypeOrmModule.forFeature([Article, Youtube, Topic, User, Pdf]),
      ],
      providers: [ArticleService, TopicsService],
    }).compile();
    controller = module.get<ArticleController>(ArticleController);
    service = module.get<ArticleService>(ArticleService);
    repo = module.get(getRepositoryToken(Topic));
  });

  afterAll(async () => {
    module.close();
  });

  afterEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
    await repo.query('TRUNCATE TABLE public.topic CASCADE;');
    await repo.query('TRUNCATE TABLE public.article CASCADE;');
  });

  beforeEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
    await repo.query('TRUNCATE TABLE public.topic CASCADE;');
    await repo.query('TRUNCATE TABLE public.article CASCADE;');
  });

  describe('get all articles listed', () => {
    it('should throw error if topic does not exist', async () => {
      const [savedTopic, savedArticle] = await saveOneArticleToTopic(repo);
      expect(
        controller.findAllArticles(savedTopic.id + 100, 1, 2),
      ).rejects.toThrow('No topic found!');
    });
    it('should return all articles in a topic', async () => {
      const [savedTopic, savedArticles] = await saveMultipleArticlesToTopic(
        repo,
      );
      const foundArticles = await controller.findAllArticles(
        savedTopic.id,
        1,
        2,
      );
      expect(foundArticles.resources).toEqual(savedArticles.slice(0, 2));
    });
  });

  describe('get one article listed', () => {
    it('should return the article with given id', async () => {
      const [savedTopic, savedArticle] = await saveOneArticleToTopic(repo);
      const foundArticle = await controller.findOneArticle(savedArticle.id);
      expect(foundArticle).toEqual(savedArticle);
    });
  });

  describe('save an article', () => {
    it('should throw error if not all parameters are supplied', async () => {
      await expect(controller.saveArticle()).rejects.toThrow(
        'Not enough data!',
      );
    });

    it('should throw error if topicId is wrong', async () => {
      const topic = await createOneTopic(repo);
      const articleDetails = {
        title: articleTitle,
        url,
        topicId: topic.id + 100,
      };
      await expect(controller.saveArticle(articleDetails)).rejects.toThrow(
        'Topic does not exist!',
      );
    });

    it('should save the article to the database and return it with an id', async () => {
      const topic = await createOneTopic(repo);
      const articleDetails = {
        title: articleTitle,
        url,
        topicId: topic.id,
      };
      const result = await controller.saveArticle(articleDetails);
      expect(result.articleDetails.id).toBeTruthy();
    });
  });

  describe('update a single article', () => {
    it('should throw error if article does not exist', async () => {
      const [savedTopic, savedArticle] = await saveOneArticleToTopic(repo);
      const originalArticle = { ...savedArticle };
      const articleUpdate = { lastActive: Date.now() };
      expect(
        controller.updateArticle(savedArticle.id + 100, articleUpdate),
      ).rejects.toThrow('No article found to update!');
    });
    it('should update a article', async () => {
      const [savedTopic, savedArticle] = await saveOneArticleToTopic(repo);
      const originalArticle = { ...savedArticle };
      const articleUpdate = { lastActive: Date.now() };
      const updatedArticle = await controller.updateArticle(
        savedArticle.id,
        articleUpdate,
      );
      expect(updatedArticle.lastActive).not.toEqual(originalArticle.lastActive);
    });
  });

  describe('delete a single article', () => {
    it('should throw error if article does not exist', async () => {
      const [savedTopic, savedArticle] = await saveOneArticleToTopic(repo);
      const originalArticle = { ...savedArticle };
      const articleUpdate = { lastActive: Date.now() };
      expect(
        controller.deleteArticle(savedArticle.id + 100, articleUpdate),
      ).rejects.toThrow('No article found to update!');
    });
    it('should update a article', async () => {
      const [savedTopic, savedArticle] = await saveOneArticleToTopic(repo);
      const originalArticle = { ...savedArticle };
      const articleUpdate = { lastActive: Date.now() };
      await controller.deleteArticle(savedArticle.id, articleUpdate);
      const deletedArticle = await service.findArticleById(savedArticle.id);
      expect(deletedArticle).toBeFalsy();
    });
  });
});
