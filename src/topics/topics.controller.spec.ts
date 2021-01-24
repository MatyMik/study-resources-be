import { Test } from '@nestjs/testing';
import { TopicsController } from './topics.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Topic } from './topic.entity';
import * as bcrypt from 'bcrypt-nodejs';
import { User } from '../authentication/user.entity';
import { TopicsService } from './topics.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { Pdf } from '../pdf/pdf.entity';
import { Article } from '../article/article.entity';
import { Youtube } from '../youtube/youtube.entity';
import { YoutubeService } from '../youtube/youtube.service';

const testEmail = 'test@test.com';
const password = "asdfasd'1";
const topicTitle = 'React';
const articleTitle = 'React article';
const url = 'http://localhost';

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedP: string = await bcrypt.hashSync(password, salt);
  return hashedP;
};

describe('TopicsController', () => {
  let controller: TopicsController;
  let module;
  let repo;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [TopicsController],
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          entities: [Topic, User, Pdf, Youtube, Article],
          autoLoadEntities: true,
          synchronize: true,
          keepConnectionAlive: false,
        }),
        TypeOrmModule.forFeature([Topic, User, Pdf, Youtube, Article]),
      ],
      providers: [TopicsService, AuthenticationService, YoutubeService],
    }).compile();
    controller = module.get(TopicsController);
    repo = module.get(getRepositoryToken(Topic));
  });

  afterAll(async () => {
    module.close();
  });
  afterEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
    await repo.query('TRUNCATE TABLE public.topic CASCADE;');
  });

  beforeEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
    await repo.query('TRUNCATE TABLE public.topic CASCADE;');
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get all topics', () => {
    it('should return all topics for a given user', async () => {
      const hashedPassword = await hashPassword(password);
      await repo.query(
        `INSERT INTO public."user"(email, password) VALUES('${testEmail}', '${hashedPassword}');`,
      );

      const [savedUser] = await repo.query(
        `SELECT id FROM public."user"
        WHERE email = '${testEmail}';`,
      );
      await repo.query(
        `INSERT INTO public.topic(title, "userId") VALUES('topicTitle', ${savedUser.id});`,
      );
      const savedTopics = await repo.query(
        `SELECT id, title, "lastActive" FROM public.topic 
        WHERE "userId" = '${savedUser.id}';`,
      );

      const returnedTopics = await controller.getTopics(savedUser.id);
      expect(returnedTopics).toEqual(savedTopics);
    });
  });
  describe('add a topic', () => {
    it('should throw error if topic already exists', async () => {
      const hashedPassword = await hashPassword(password);
      await repo.query(
        `INSERT INTO public."user"(email, password) VALUES('${testEmail}', '${hashedPassword}');`,
      );

      const [savedUser] = await repo.query(
        `SELECT id FROM public."user"
          WHERE email = '${testEmail}';`,
      );
      await repo.query(
        `INSERT INTO public.topic(title, "userId") VALUES('${topicTitle}', ${savedUser.id});`,
      );
      const topic = { userId: savedUser.id, title: topicTitle };

      expect(controller.addTopic(topic)).rejects.toThrow(
        'This topic already exists!',
      );
    });
    it('should save topic', async () => {
      const hashedPassword = await hashPassword(password);
      await repo.query(
        `INSERT INTO public."user"(email, password) VALUES('${testEmail}', '${hashedPassword}');`,
      );

      const [savedUser] = await repo.query(
        `SELECT id FROM public."user"
          WHERE email = '${testEmail}';`,
      );
      const topic = { userId: savedUser.id, title: topicTitle };

      const savedTopic = await controller.addTopic(topic);
      expect(savedTopic.title).toEqual(topicTitle);
    });
  });

  describe('update a topic', () => {
    it('should throw error if topic does not exists', async () => {
      const hashedPassword = await hashPassword(password);
      await repo.query(
        `INSERT INTO public."user"(email, password) VALUES('${testEmail}', '${hashedPassword}');`,
      );

      const [savedUser] = await repo.query(
        `SELECT id FROM public."user"
          WHERE email = '${testEmail}';`,
      );

      const topic = { topicId: 1, title: topicTitle, lastActive: Date.now() };

      expect(controller.updateTopic(topic)).rejects.toThrow(
        'Topic does not exist!',
      );
    });
    it('should update a given topic', async () => {
      const hashedPassword = await hashPassword(password);
      await repo.query(
        `INSERT INTO public."user"(email, password) VALUES('${testEmail}', '${hashedPassword}');`,
      );

      const [savedUser] = await repo.query(
        `SELECT id FROM public."user"
          WHERE email = '${testEmail}';`,
      );
      await repo.query(
        `INSERT INTO public.topic(title, "userId") VALUES('${topicTitle}', ${savedUser.id});`,
      );

      const [savedTopic] = await repo.query(
        `SELECT id, title, "lastActive" FROM public.topic 
        WHERE title = '${topicTitle}';`,
      );

      const originalSavedTopic = { ...savedTopic };
      const topic = {
        userId: savedUser.id,
        title: topicTitle + 'a',
        lastActive: Date.now(),
        topicId: originalSavedTopic.id,
      };

      const updatedTopic = await controller.updateTopic(topic);
      expect(originalSavedTopic.title).not.toEqual(updatedTopic.title);
      expect(originalSavedTopic.lastActive).not.toEqual(
        updatedTopic.lastActive,
      );
    });
  });
  describe('delete a topic', () => {
    it('should throw error if topic does not exists', async () => {
      const hashedPassword = await hashPassword(password);
      await repo.query(
        `INSERT INTO public."user"(email, password) VALUES('${testEmail}', '${hashedPassword}');`,
      );

      const [savedUser] = await repo.query(
        `SELECT id FROM public."user"
          WHERE email = '${testEmail}';`,
      );

      const topic = { topicId: 1, title: topicTitle, lastActive: Date.now() };

      expect(controller.deleteTopic(1)).rejects.toThrow(
        'Topic does not exist!',
      );
    });
    it('should delete a given topic and all resources in it', async () => {
      const hashedPassword = await hashPassword(password);
      await repo.query(
        `INSERT INTO public."user"(email, password) VALUES('${testEmail}', '${hashedPassword}');`,
      );

      const [savedUser] = await repo.query(
        `SELECT id FROM public."user"
          WHERE email = '${testEmail}';`,
      );
      await repo.query(
        `INSERT INTO public.topic(title, "userId") VALUES('${topicTitle}', ${savedUser.id});`,
      );

      const [savedTopic] = await repo.query(
        `SELECT id, title, "lastActive" FROM public.topic 
        WHERE title = '${topicTitle}';`,
      );

      await repo.query(
        `INSERT INTO public.article(title, "topicId", url) VALUES('${articleTitle}', ${savedTopic.id}, '${url}');`,
      );

      const [
        savedArticle,
      ] = await repo.query(`SELECT id, title, "lastActive" FROM public.article 
      WHERE title = '${articleTitle}' AND "topicId" = ${savedTopic.id};`);

      console.log(savedTopic);
      await controller.deleteTopic(savedTopic.id);

      const [
        articleAfterDelete,
      ] = await repo.query(`SELECT id, title, "lastActive" FROM public.article 
      WHERE id = ${savedArticle.id};`);

      const [
        topicAfterDelete,
      ] = await repo.query(`SELECT id, title, "lastActive" FROM public.topic 
      WHERE id = ${savedTopic.id};`);
      console.log(topicAfterDelete);

      expect(articleAfterDelete).toBeFalsy();
      expect(topicAfterDelete).toBeFalsy();
    });
  });
});
