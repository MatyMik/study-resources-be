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
import { getRepositoryToken } from '@nestjs/typeorm';

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
      imports: [AppModule],
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
});
