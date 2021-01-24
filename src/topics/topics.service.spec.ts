import { TopicsService } from './topics.service';
import { Test } from '@nestjs/testing';
import { TopicsController } from './topics.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Topic } from './topic.entity';
import { User } from '../authentication/user.entity';
import * as bcrypt from 'bcrypt-nodejs';
import { AuthenticationService } from '../authentication/authentication.service';
import { Pdf } from '../pdf/pdf.entity';
import { Article } from '../article/article.entity';
import { Youtube } from '../youtube/youtube.entity';

const testEmail = 'test@test.com';
const password = "asdfasd'1";
const topicTitle = 'React';
const articleTitle = 'asdfasd';
const url = 'asdfs';

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedP: string = await bcrypt.hashSync(password, salt);
  return hashedP;
};

describe('TopicsService', () => {
  let service: TopicsService;
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
        TypeOrmModule.forFeature([Topic, User, Youtube, Article, Pdf]),
      ],
      providers: [TopicsService, AuthenticationService],
    }).compile();
    service = module.get(TopicsService);
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
  describe(' get all topics', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return all topics for a user', async () => {
      const hashedPassword = await hashPassword(password);
      await repo.query(
        `INSERT INTO public."user"(email, password) VALUES('${testEmail}', '${hashedPassword}');`,
      );

      const [savedUser] = await repo.query(
        `SELECT id FROM public."user"
        WHERE email = '${testEmail}';`,
      );

      await repo.query(
        `INSERT INTO public.topic(title, "userId") 
        VALUES('topicTitle', ${savedUser.id}),
        ('topicTitle', ${savedUser.id}),
        ('topicTitle', ${savedUser.id})
        ;`,
      );
      const savedTopics = await repo.query(
        `SELECT id, title, "lastActive" FROM public.topic 
        WHERE "userId" = '${savedUser.id}';`,
      );

      const returnedTopics = await service.getTopics(savedUser.id);
      expect(savedTopics).toEqual(returnedTopics);
    });
  });
  describe('add a topic', () => {
    it('should add a topic', async () => {
      const hashedPassword = await hashPassword(password);
      await repo.query(
        `INSERT INTO public."user"(email, password) VALUES('${testEmail}', '${hashedPassword}');`,
      );

      const [savedUser] = await repo.query(
        `SELECT id FROM public."user"
          WHERE email = '${testEmail}';`,
      );

      const savedTopic = await service.addTopic(topicTitle, savedUser);
      expect(savedTopic.title).toEqual(topicTitle);
    });
  });
  describe('find  a topic by title', () => {
    it('should find a topic for a given user by title', async () => {
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
      const foundTopic = await service.findByTitle(topicTitle, savedUser);

      expect(foundTopic.title).toEqual(topicTitle);
    });
  });
  describe(' find a topics based on id', () => {
    it('should return a topics with a given id', async () => {
      const hashedPassword = await hashPassword(password);
      await repo.query(
        `INSERT INTO public."user"(email, password) VALUES('${testEmail}', '${hashedPassword}');`,
      );

      const [savedUser] = await repo.query(
        `SELECT id FROM public."user"
        WHERE email = '${testEmail}';`,
      );

      await repo.query(
        `INSERT INTO public.topic(title, "userId") 
        VALUES('topicTitle', ${savedUser.id});`,
      );
      const [savedTopic] = await repo.query(
        `SELECT id, title, "lastActive" FROM public.topic 
        WHERE "userId" = '${savedUser.id}';`,
      );

      const returnedTopic = await service.findTopicById(savedTopic.id);
      expect(savedTopic).toEqual(returnedTopic);
    });
  });
  describe('update a topic', () => {
    it('should update a topic by id', async () => {
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

      const OriginalSavedTopic = { ...savedTopic };

      const topic = {
        userId: savedUser.id,
        title: topicTitle + 'a',
        lastActive: Date.now(),
        topicId: savedTopic.id,
      };

      const updatedTopic = await service.updateTopic(topic, savedTopic);
      expect(OriginalSavedTopic.title).not.toEqual(updatedTopic.title);
      expect(OriginalSavedTopic.lastActive).not.toEqual(
        updatedTopic.lastActive,
      );
    });
  });
  describe('delete a topic', () => {
    it('should delete a topic by id', async () => {
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

      await service.deleteTopic(savedTopic.id);

      const [
        articleAfterDelete,
      ] = await repo.query(`SELECT id, title, "lastActive" FROM public.article 
      WHERE id = ${savedArticle.id};`);

      const [
        topicAfterDelete,
      ] = await repo.query(`SELECT id, title, "lastActive" FROM public.topic 
      WHERE id = ${savedTopic.id};`);
      expect(topicAfterDelete).toBeFalsy();
      expect(articleAfterDelete).toBeFalsy();
    });
  });
});
