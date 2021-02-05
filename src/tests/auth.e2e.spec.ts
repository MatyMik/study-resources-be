import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import { RequestValidationError } from '../errors/request-validation-error';
import { HttpExceptionFilter } from '../middlewares/error-filter';
import { AuthenticationController } from '../authentication/authentication.controller';
import { User } from '../authentication/user.entity';
import { AuthenticationService } from '../authentication/authentication.service';
import * as cookieParser from 'cookie-parser';
import { AuthGuard } from '../middlewares/tokens';
import { Topic } from '../topics/topic.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { Youtube } from '../youtube/youtube.entity';
import { Article } from '../article/article.entity';
import { Pdf } from '../pdf/pdf.entity';

const password = '21Passrd';
const email = 'test@test.com';
const wrongPasword = '21Paw1ord';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let controller;
  let repo;
  let service;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        AppModule,
        // ConfigModule.forRoot({ load: [configuration] }),
        // TypeOrmModule.forRoot({
        //   type: 'postgres',
        //   host: process.env.POSTGRES_HOST,
        //   port: parseInt(process.env.POSTGRES_PORT),
        //   username: process.env.POSTGRES_USER,
        //   password: process.env.POSTGRES_PASSWORD,
        //   database: process.env.POSTGRES_DB,
        //   entities: [User, Topic, Youtube, Article, Pdf],
        //   autoLoadEntities: true,
        //   synchronize: true,
        //   keepConnectionAlive: true,
        // }),
        // TypeOrmModule.forFeature([User, Topic]),
      ],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalGuards(new AuthGuard());
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (errors) => new RequestValidationError(errors),
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    controller = app.get<AuthenticationController>(AuthenticationController);
    repo = module.get<User>(getRepositoryToken(User));
    service = module.get<AuthenticationService>(AuthenticationService);
    await app.init();
  });

  afterEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
  });

  beforeEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
  });

  afterAll(async () => {
    module.close();
  });

  it('/auth/signup', async () => {
    const response = await request(app.getHttpServer()).post('/auth/signup');
    expect(response.body.errors.length).toBe(3);
    expect(response.body.errors[0].field).toBe('email');
    expect(response.body.errors[1].field).toBe('password');
    expect(response.body.errors[2].field).toBe('confirmPassword');
    expect(response.body.errors[0].message[0]).toBe('Invalid email format!');
    expect(
      response.body.errors[1].message.includes('Password too short!'),
    ).toBe(true);
  });

  it('/auth/login', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login');
    expect(response.body.errors.length).toBe(2);
    expect(response.body.errors[0].field).toBe('email');
    expect(response.body.errors[1].field).toBe('password');
    expect(response.body.errors[0].message[0]).toBe('Invalid email format!');
    expect(
      response.body.errors[1].message.includes('Password too short!'),
    ).toBe(true);
  });

  it('/auth/login', async () => {
    const signupData = { email, password, confirmPassword: password };
    await controller.signup(signupData);
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    expect(response.header).toBeTruthy();
  });

  it('should return an auth token and refresh token after login', async () => {
    const signupData = { email, password, confirmPassword: password };
    await controller.signup(signupData);
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    expect(response.body.token).toBeTruthy();
    expect(response.header['set-cookie']).toBeTruthy();
  });

  it('should return a new auth token and refresh token after valid refresh token supplied', async () => {
    const refreshToken = await service.createJwtToken(
      { email },
      process.env.REFRESH_TOKEN_SECRET,
      '5d',
    );
    const newResponse = await request(app.getHttpServer())
      .get('/auth/refreshtoken')
      .set('Cookie', [`refreshToken=${refreshToken}`]);
    expect(refreshToken).not.toBe(
      newResponse.header['set-cookie'][0].split('=')[0],
    );
  });
});
