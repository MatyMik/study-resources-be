import { Test, TestingModule } from '@nestjs/testing';
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
const email = 'test@test.com';
const user = {
  email,
  password,
};

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let module: TestingModule;
  let repo;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [AuthenticationService],
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
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should return a string that is not equal to the original string', async () => {
      const response = await service.hashPassword(password);
      expect(typeof response).toBe('string');
      expect(response).not.toEqual(password);
    });
  });

  describe('create user', () => {
    it('should create a user', async () => {
      const savedUser = await service.createUser(user);
      expect(savedUser.id).toBeTruthy();
    });
  });

  describe('find user by email', () => {
    it('should find a user by email', async () => {
      await service.createUser(user);

      const foundUser = await service.findUserByEmail(email);
      expect(foundUser.email).toEqual(email);
    });
  });
  describe('find user by id', () => {
    it('should find a user by email', async () => {
      await service.createUser(user);

      const foundUser = await service.findUserByEmail(email);
      const userById = await service.findById(foundUser.id);
      expect(userById.email).toEqual(email);
    });
  });
  describe('validate password', () => {
    it('should return false if the supplied string is not equal to a given hashed string', async () => {
      const hashedPassword = await service.hashPassword(password);
      const isEqual = await service.validatePassword(
        password + 'a',
        hashedPassword,
      );

      expect(isEqual).toEqual(false);
    });

    it('should return true if the supplied string is equal to a given hashed string', async () => {
      const hashedPassword = await service.hashPassword(password);
      const isEqual = await service.validatePassword(password, hashedPassword);

      expect(isEqual).toEqual(true);
    });
  });
  describe('create a jwt token', () => {
    it('should create a jwt token', async () => {
      const userData = { email, password };
      const secret = 'secret';
      const token = await service.createJwtToken(userData, secret, '15m');

      expect(token).toBeTruthy();
    });
  });
  describe('verify a jwt token', () => {
    it('should return the user object if a valid jwt token', async () => {
      const userData = { email, password };
      const secret = 'secret';
      const token = await service.createJwtToken(userData, secret, '150s');

      const isValid = service.verifyJwtToken(token, secret);
      expect(isValid).toBeTruthy();
    });
    it('should return null for an invalid jwt token', async () => {
      const userData = { email, password };
      const secret = 'secret';
      const token = await service.createJwtToken(userData, secret, '150s');

      const isNotValid = service.verifyJwtToken(token + 'a', secret);
      expect(isNotValid).toBe(null);
    });
  });
});
