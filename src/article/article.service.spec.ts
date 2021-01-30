import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { Topic } from '../topics/topic.entity';
import { User } from '../authentication/user.entity';
import { Pdf } from '../pdf/pdf.entity';
import {
  saveOneArticleToTopic,
  saveMultipleArticlesToTopic,
  createOneTopic,
} from '../tests/test-helpers';
import { articleTitle, url } from '../tests/test-data';
import { ArticleService } from './article.service';
import { TopicsService } from '../topics/topics.service';
import { Youtube } from '../youtube/youtube.entity';

describe('ArticleService', () => {
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
        TypeOrmModule.forFeature([Article, Youtube, Topic, Pdf, User]),
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

  describe('save article details to db', () => {
    it('should return the saved article', async () => {
      const savedTopic = await createOneTopic(repo);
      const articleData = { title: articleTitle, url };
      const savedArticle = await service.saveOneArticle(
        articleData,
        savedTopic,
      );
      expect(savedArticle.id).toBeTruthy();
    });
  });
  describe('update article by id', () => {
    it('should update the saved article given the id', async () => {
      const [topic, article] = await saveOneArticleToTopic(repo);
      const originalArticle = { ...article };
      const updateArticle = { lastActive: Date.now() };
      const updatedArticle = await service.updateArticle(
        article,
        updateArticle,
      );
      expect(updatedArticle.lastActive).not.toEqual(originalArticle.lastActive);
    });
  });
  describe('find article by id', () => {
    it('should return the saved article given the id', async () => {
      const [topic, article] = await saveOneArticleToTopic(repo);
      const savedArticle = await service.findArticleById(article.id);
      expect(savedArticle).toEqual(article);
    });
  });
  describe('delete article by id', () => {
    it('should delete the saved article given the id', async () => {
      const [topic, article] = await saveOneArticleToTopic(repo);
      await service.deleteArticle(article.id);
      const deletedArticle = await service.findArticleById(article.id);
      expect(deletedArticle).toBeFalsy();
    });
  });

  describe('find all articles in topic', () => {
    it('should return all the saved articles in given topic', async () => {
      const [topic, articles] = await saveMultipleArticlesToTopic(repo);
      const savedArticles = await service.findAllArticlesInTopic(
        topic,
        1,
        2,
        false,
      );
      expect(savedArticles).toEqual(articles.slice(0, 2));
    });
  });
});
