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
  getSavedCourse,
} from '../tests/test-helpers';
import { courseData } from '../tests/test-data';
import { Article } from '../article/article.entity';
import { Youtube } from '../youtube/youtube.entity';
import { TopicsService } from '../topics/topics.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { Video, Course, Section } from './entities';

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
    repo = module.get(getRepositoryToken(Course));
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
    it('should throw an error if the topic is not found', async () => {
      const [savedTopic, savedCourse] = await saveOneCourseToTopic(repo);
      const course = { topicId: savedTopic.id + 100 };
      expect(controller.saveCourse(course)).rejects.toThrow(
        'Topic was not found!',
      );
    });
    it('should add', async () => {
      const topic = await createOneTopic(repo);
      const courseTosave = { ...courseData, topicId: topic.id };
      const savedCourse = await controller.saveCourse(courseTosave);
      const { course, section, video } = await getSavedCourse(
        repo,
        savedCourse.id,
      );
    });
  });
  describe('return a course', () => {
    it('should throw an error if the course is not found', async () => {
      const [savedTopic, savedCourse] = await saveOneCourseToTopic(repo);
      expect(controller.findCourse(savedCourse.id + 100)).rejects.toThrow(
        'Course was not found!',
      );
    });
    it('should return a Course', async () => {
      const [savedTopic, savedCourse] = await saveOneCourseToTopic(repo);
      const response = await controller.findCourse(savedCourse.id);
      expect(response.course.title).toEqual(savedCourse.title);
    });
  });
  describe('return all courses', () => {
    it('should throw an error if the topic is not found', async () => {
      const [savedTopic, savedCourses] = await saveMiltipleCoursesToTopic(repo);
      expect(controller.findAllCourses(savedTopic.id + 100)).rejects.toThrow(
        'Topic was not found!',
      );
    });
    it('should return all Courses', async () => {
      const [savedTopic, savedCourses] = await saveMiltipleCoursesToTopic(repo);
      const response = await controller.findAllCourses(savedTopic.id, 1, 5);
      expect(response.resources).toEqual(savedCourses);
    });
  });
  describe('return a section', () => {
    it('should throw an error if the course is not found', async () => {
      const [course, section] = await saveOneSectionToCourse(repo);
      expect(controller.findSection(section.id + 100)).rejects.toThrow(
        'Section was not found!',
      );
    });
    it('should return a section', async () => {
      const [course, section] = await saveOneSectionToCourse(repo);
      console.log(section.id);
      const response = await controller.findSection(section.id);
      expect(response.section.title).toEqual(section.title);
    });
  });
  describe('return a video', () => {
    it('should throw an error if the course is not found', async () => {
      const { course, section, video } = await saveOneCourseSectionVideoToTopic(
        repo,
      );
      expect(controller.findVideo(section.id + 100)).rejects.toThrow(
        'Video was not found!',
      );
    });
    it('should return a section', async () => {
      const { course, section, video } = await saveOneCourseSectionVideoToTopic(
        repo,
      );
      const response = await controller.findVideo(video.id);
      expect(response.video.title).toEqual(video.title);
    });
  });
  describe('update a course', () => {
    it('should throw an error if the course is not found', async () => {
      const [savedTopic, savedCourse] = await saveOneCourseToTopic(repo);
      expect(controller.updateCourse(savedCourse.id + 100)).rejects.toThrow(
        'Course was not found!',
      );
    });
    it('should update a Course', async () => {
      const [savedTopic, savedCourse] = await saveOneCourseToTopic(repo);
      const newCourseData = { title: 'new Title' };
      const response = await controller.updateCourse(
        savedCourse.id,
        newCourseData,
      );
      expect(response.course.title).not.toEqual(savedCourse.title);
    });
  });
  describe('update a section', () => {
    it('should throw an error if the section is not found', async () => {
      const [course, section] = await saveOneSectionToCourse(repo);
      expect(controller.updateSection(section.id + 100)).rejects.toThrow(
        'Section was not found!',
      );
    });
    it('should update a Section', async () => {
      const [course, section] = await saveOneSectionToCourse(repo);
      const response = await controller.updateSection(section.id, {
        title: 'New titleasdf',
      });
      expect(response.section.title).not.toEqual(section.title);
    });
  });
  describe('update a video', () => {
    it('should throw an error if the section is not found', async () => {
      const { video } = await saveOneCourseSectionVideoToTopic(repo);
      expect(controller.updateVideo(video.id + 100)).rejects.toThrow(
        'Video was not found!',
      );
    });
    it('should update a Section', async () => {
      const { video } = await saveOneCourseSectionVideoToTopic(repo);
      const originalVideo = { ...video };
      const response = await controller.updateVideo(video.id, {
        title: 'New titleasdf',
      });
      expect(response.video.title).not.toEqual(originalVideo.title);
    });
  });
  describe('delete a course', () => {
    it('should throw an error if the course is not found', async () => {
      const [savedTopic, savedCourse] = await saveOneCourseToTopic(repo);
      expect(controller.findCourse(savedCourse.id + 100)).rejects.toThrow(
        'Course was not found!',
      );
    });
    it('should delete a Course', async () => {
      const [savedTopic, savedCourse] = await saveOneCourseToTopic(repo);
      await controller.deleteCourse(savedCourse.id);
      expect(controller.findCourse(savedCourse.id)).rejects.toThrow(
        'Course was not found!',
      );
    });
  });
});
