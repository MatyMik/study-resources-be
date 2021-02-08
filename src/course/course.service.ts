import { Injectable, Put } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video, Course, Section } from './entities';
import { Topic } from '../topics/topic.entity';
import { CourseUpdateDto } from './dto/course-update-dto';
import { SectionUpdateDto } from './dto/section-update-dto';
import { VideoUpdateDto } from './dto/video-update-dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Video) private video: Repository<Video>,
    @InjectRepository(Course) private course: Repository<Course>,
    @InjectRepository(Section) private section: Repository<Section>,
  ) {}
  async saveCourse(courseData: CreateCourseDto, topic: Topic) {
    const newCourse = Course.create();
    newCourse.title = courseData.title;
    newCourse.totalItems = courseData.totalItems;
    newCourse.topic = topic;
    newCourse.sections = [];
    const { sections } = courseData;
    sections.forEach(async (section) => {
      const newSection = Section.create();
      newSection.title = section.title;
      newSection.order = section.order;
      newSection.videos = [];
      const { videos } = section;
      videos.forEach(async (video) => {
        const newVideo = Video.create();
        newVideo.order = video.order;
        newVideo.title = video.title;
        newVideo.url = video.url;
        newSection.videos.push(newVideo);
      });
      newCourse.sections.push(newSection);
    });
    const [savedCourse] = await this.course.save<Course>([newCourse]);
    return savedCourse;
  }

  async addSectionToCourse(course: Course, courseUpdateData: CreateCourseDto) {
    const { sections } = courseUpdateData;
    sections.forEach(async (section) => {
      const newSection = Section.create();
      newSection.title = section.title;
      newSection.order = section.order;
      newSection.course = course;
      newSection.videos = [];
      const { videos } = section;
      videos.forEach(async (video) => {
        const newVideo = Video.create();
        newVideo.order = video.order;
        newVideo.title = video.title;
        newVideo.url = video.url;
        newSection.videos.push(newVideo);
      });
      course.sections.push(newSection);
    });
    course.totalItems = courseUpdateData.totalItems || course.totalItems;
    const [savedCourse] = await this.course.save<Course>([course]);
    return savedCourse;
  }

  async findCourseById(courseId: number): Promise<Course> {
    const [foundCourse] = await this.course.query(`SELECT *, (
      SELECT json_agg(Row_to_json(sections)) AS sections FROM (
        SELECT section.* , (
          SELECT json_agg(Row_to_json(videos)) AS videos FROM (SELECT * FROM public.video ORDER BY public.video."order") AS videos WHERE videos."sectionId" = section.id
        ) FROM public.section AS section WHERE section."courseId"=public.course.id ORDER BY section."order"
      ) AS sections
    ) FROM public.course WHERE id = ${courseId}`);
    return foundCourse;
  }
  async countCourses(topicId: number, archived: boolean) {
    const [{ count }] = await this.course.query(
      `SELECT COUNT(id) AS count FROM public.course WHERE "topicId" = ${topicId} AND archived=${archived}`,
    );
    return count;
  }

  async findAllCourses(
    topic: Topic,
    page: number,
    itemsPerPage: number,
    archived: boolean,
  ): Promise<Course[]> {
    const limit = itemsPerPage;
    const offset = (page - 1) * itemsPerPage;
    return await this.course.find({
      where: { topic, archived },
      order: { lastActive: 'DESC' },
      skip: offset,
      take: limit,
      cache: true,
    });
  }

  async findSectionById(sectionId: number) {
    const [foundSection] = await this.section.find({ id: sectionId });
    return foundSection;
  }

  async findVideoById(videoId: number) {
    const [video] = await this.video.find({ id: videoId });
    return video;
  }

  async updateCourse(newCourseFields: CourseUpdateDto, currentCourse: Course) {
    currentCourse.title = newCourseFields.title || currentCourse.title;
    currentCourse.lastWatched =
      newCourseFields.lastWatched || currentCourse.lastWatched;
    currentCourse.lastActive = Date.now();
    currentCourse.archived = !!newCourseFields.archived;
    const [updatedCourse] = await this.course.save<Course>([currentCourse]);
    return updatedCourse;
  }

  async updateSection(
    newSectionFields: SectionUpdateDto,
    currentSection: Section,
  ) {
    currentSection.title = newSectionFields.title || currentSection.title;
    const [updatedSection] = await this.section.save<Section>([currentSection]);
    return updatedSection;
  }

  async updateVideo(newVideoFields: VideoUpdateDto, currentVideo: Video) {
    currentVideo.title = newVideoFields.title || currentVideo.title;
    currentVideo.order = newVideoFields.order || currentVideo.order;
    currentVideo.duration = newVideoFields.duration || currentVideo.duration;
    currentVideo.watched = newVideoFields.watched || currentVideo.watched;
    currentVideo.minutesWatched =
      newVideoFields.minutesWatched || currentVideo.minutesWatched;
    const [updatedVideo] = await this.video.save<Video>([currentVideo]);
    return updatedVideo;
  }

  async deleteCourse(courseId: number) {
    await this.course.delete(courseId);
    return;
  }
  async updateLastWatched(course: Course) {
    const [{ lastWatched }] = await this.course.query(
      `SELECT MAX("order") AS "lastWatched" FROM public.video WHERE watched = true AND "sectionId" IN (SELECT id FROM public.section WHERE "courseId" = ${course.id})`,
    );
    course.lastWatched = lastWatched;
    course.lastActive = Date.now();
    await this.course.save<Course>([course]);
  }
}
