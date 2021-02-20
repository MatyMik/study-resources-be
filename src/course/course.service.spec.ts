import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Pdf } from '../pdf/pdf.entity';
import { Topic } from '../topics/topic.entity';
import { User } from '../authentication/user.entity';
import {
  saveOneCourseToTopic,
  saveOneCourseSectionVideoToTopic,
  saveOneSectionToCourse,
  createOneTopic,
  saveMiltipleCoursesToTopic,
} from '../tests/test-helpers';
import { Article } from '../article/article.entity';
import { Youtube } from '../youtube/youtube.entity';
import { TopicsService } from '../topics/topics.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { Video, Course, Section } from './entities';
import { courseData } from '../tests/test-data';

describe('CourseController', () => {
  let controller;
  let module: TestingModule;
  let repo;
  let service;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [CourseController],
      imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          entities: [
            Pdf,
            Topic,
            User,
            Article,
            Youtube,
            Video,
            Course,
            Section,
          ],
          autoLoadEntities: true,
          synchronize: true,
          keepConnectionAlive: false,
        }),
        TypeOrmModule.forFeature([Pdf, Topic, User, Video, Course, Section]),
      ],
      providers: [CourseService, TopicsService, AuthenticationService],
    }).compile();
    controller = module.get<CourseController>(CourseController);
    service = module.get<CourseService>(CourseService);
    repo = module.get(getRepositoryToken(Topic));
  });

  afterAll(async () => {
    module.close();
  });

  afterEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
    await repo.query('TRUNCATE TABLE public.topic CASCADE;');
    await repo.query('TRUNCATE TABLE public.course CASCADE;');
  });

  beforeEach(async () => {
    await repo.query('TRUNCATE TABLE public."user" CASCADE;');
    await repo.query('TRUNCATE TABLE public.topic CASCADE;');
    await repo.query('TRUNCATE TABLE public.course CASCADE;');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('add a course', () => {
    it('should add a course with a section with a video', async () => {
      const topic = await createOneTopic(repo);
      const courseTosave = { ...courseData, topicId: topic.id };

      const courseReturned = await service.saveCourse(courseTosave);
      expect(courseReturned.title).toEqual(courseTosave.title);
      expect(courseReturned.sections[0].title).toEqual(
        courseTosave.sections[0].title,
      );
      expect(courseReturned.sections[0].videos[0].title).toEqual(
        courseTosave.sections[0].videos[0].title,
      );
    });
  });
  describe('return a course', () => {
    it('should return a Course', async () => {
      const [savedTopic, savedCourse] = await saveOneCourseToTopic(repo);
      const foundCourse = await service.findCourseById(savedCourse.id);
      expect(foundCourse.title).toEqual(savedCourse.title);
    });
  });
  describe('return all courses', () => {
    it('should return a Course', async () => {
      const [savedTopic, savedCourses] = await saveMiltipleCoursesToTopic(repo);
      const courses = await service.findAllCourses(savedTopic.id, 1, 5, false);
      expect(courses).toEqual(savedCourses);
    });
  });
  describe('return a section', () => {
    it('should return a section', async () => {
      const [course, section] = await saveOneSectionToCourse(repo);
      const response = await service.findSectionById(section.id);
      expect(response.title).toEqual(section.title);
    });
  });
  describe('return a video', () => {
    it('should return a section', async () => {
      const { video } = await saveOneCourseSectionVideoToTopic(repo);
      const foundVideo = await service.findVideoById(video.id);
      expect(foundVideo.title).toEqual(video.title);
    });
  });
  describe('update a course', () => {
    it('should update a Course', async () => {
      const [savedTopic, savedCourse] = await saveOneCourseToTopic(repo);
      const response = await service.updateCourse(savedCourse, {});
      expect(response.lastActive).not.toEqual(savedCourse.lastActive);
    });
  });
  describe('update a section', () => {
    it('should update a section', async () => {
      const [course, section] = await saveOneSectionToCourse(repo);
      const originalSection = { ...section };
      const response = await service.updateSection(
        {
          title: 'asdfasdf34',
        },
        section,
      );
      expect(response.title).not.toEqual(originalSection.title);
    });
  });
  describe('update a video', () => {
    it('should update a Section', async () => {
      const { video } = await saveOneCourseSectionVideoToTopic(repo);
      const originalVideo = { ...video };
      const response = await service.updateVideo(
        {
          title: 'New titleasdfasdf',
        },
        video,
      );
      expect(response.title).not.toEqual(originalVideo.title);
    });
  });
  describe('delete a course', () => {
    it('should delete a Course', async () => {
      const [savedTopic, savedCourse] = await saveOneCourseToTopic(repo);
      await service.deleteCourse(savedCourse.id);
      const course = await service.findCourseById(savedCourse.id);
      expect(course).toBeFalsy();
    });
  });
});
