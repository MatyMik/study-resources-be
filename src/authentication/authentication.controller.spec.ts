import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Article } from '../article/article.entity';
import { Topic } from '../topics/topic.entity';
import { User } from './user.entity';
import { Pdf } from '../pdf/pdf.entity';
import { Youtube } from '../youtube/youtube.entity';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';

const password = '21Password';
const testEmail = 'test@test.com';
const wrongPasword = '21Passw1ord';

describe('AuthenticationController', () => {
  let controller;
  let module: TestingModule;
  let repo;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthenticationController],
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
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [AuthenticationService],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    repo = module.get<User>(getRepositoryToken(User));
  });

  afterAll(async () => {
    module.close();
  });

  afterEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
  });

  beforeEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
  });

  describe('Signup route', () => {
    it('should throw error if email is already used', async () => {
      await controller.signup({
        email: testEmail,
        password,
        confirmPassword: password,
      });

      expect(controller.signup).toBeDefined();
      await expect(
        controller.signup({
          email: testEmail,
          password,
          confirmPassword: password,
        }),
      ).rejects.toThrow('Email already in use!');
    });

    it('should throw error if passwords not match', async () => {
      expect(controller.signup).toBeDefined();
      await expect(
        controller.signup({
          email: testEmail,
          password,
          confirmPassword: wrongPasword,
        }),
      ).rejects.toThrow('Passwords do not match!');
    });

    it('should create user in db', async () => {
      await expect(
        controller.signup({
          email: testEmail,
          password,
          confirmPassword: password,
        }),
      ).resolves.toEqual({ message: 'User has been successfully saved!' });
    });
  });

  describe('login route', () => {
    it('should throw error if user not registered', async () => {
      await expect(
        controller.login(
          {
            email: testEmail + 'a',
            password,
          },
          {
            setHeader: (headerName, header, headerOptions) =>
              header + String(headerOptions),
            send: (data) => data,
            cookie: (data) => data,
          },
        ),
      ).rejects.toThrow('Email not registered!');
    });
    it('should throw an unauthorized error if the password is not valid', async () => {
      await controller.signup({
        email: testEmail,
        password,
        confirmPassword: password,
      });

      await expect(
        controller.login(
          {
            email: testEmail,
            password: password + 'a',
          },
          {
            setHeader: (headerName, header, headerOptions) =>
              header + String(headerOptions),
            send: (data) => data,
            cookie: (data) => data,
          },
        ),
      ).rejects.toThrow('Password not valid!');
    });

    it('should return a jwt token for valid credentials', async () => {
      await controller.signup({
        email: testEmail,
        password,
        confirmPassword: password,
      });

      const response = await controller.login(
        {
          email: testEmail,
          password: password,
        },
        {
          setHeader: (headerName, header, headerOptions) =>
            header + String(headerOptions),
          send: (data) => data,
          cookie: (data) => data,
        },
      );
      expect(response.token).toBeTruthy();
    });
  });
});
