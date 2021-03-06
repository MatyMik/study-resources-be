import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course-dto';
import { TopicsService } from '../topics/topics.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { NotFoundError } from '../errors/not-found-error';
import { CourseService } from './course.service';
import { CourseUpdateDto } from './dto/course-update-dto';
import { SectionUpdateDto } from './dto/section-update-dto';
import { BadRequestError } from '../errors/bad-request-error';
import { VideoWatchedUpdateDto } from './dto/video-watched-update.dto';

@Controller('course')
export class CourseController {
  constructor(
    private topicService: TopicsService,
    private courseService: CourseService,
    private user: AuthenticationService,
  ) {}
  @Post('add/course')
  async saveCourse(@Body() courseData: CreateCourseDto) {
    const foundTopic = await this.topicService.findTopicById(
      courseData.topicId,
    );
    if (!foundTopic) throw new NotFoundError('Topic was not found!');
    return await this.courseService.saveCourse(courseData, foundTopic);
  }
  @Get('course/:courseId')
  async findCourse(@Param('courseId') courseId: number) {
    const foundCourse = await this.courseService.findCourseById(courseId);
    if (!foundCourse) throw new NotFoundError('Course was not found!');
    if (foundCourse.sections && foundCourse.sections.length > 0) {
      const course = this.courseService.createUrlList(foundCourse);
      return { course };
    } else return { course: foundCourse };
  }

  @Get('all/:topicId')
  async findAllCourses(
    @Param('topicId') topicId: number,
    @Query('page') page: number,
    @Query('itemsPerPage') itemsPerPage: number,
    @Query('archived') archived: boolean,
  ) {
    const foundTopic = await this.topicService.findTopicById(topicId);
    if (!foundTopic) throw new NotFoundError('Topic was not found!');
    const courses = await this.courseService.findAllCourses(
      foundTopic,
      page,
      itemsPerPage,
      archived,
    );
    const count = await this.courseService.countCourses(topicId, archived);
    return { resources: courses, count };
  }
  @Get('update/lastwatched/:courseId')
  async updateLastWatched(@Param('courseId') courseId: number) {
    const foundCourse = await this.courseService.findCourseById(courseId);
    if (!foundCourse) throw new NotFoundError('Course was not found!');
    this.courseService.updateLastWatched(foundCourse);
  }

  @Get('section/:sectionId')
  async findSection(@Param('sectionId') sectionId: number) {
    const section = await this.courseService.findSectionById(sectionId);
    if (!section) throw new NotFoundError('Section was not found!');
    return { section };
  }

  @Get('video/:videoId')
  async findVideo(@Param('videoId') videoId: number) {
    const video = await this.courseService.findVideoById(videoId);
    if (!video) throw new NotFoundError('Video was not found!');
    return { video };
  }

  @Put('update/video/videobyurl')
  async updateVideoByUrl(@Body() newVideoData: VideoWatchedUpdateDto) {
    const { url } = newVideoData;
    const foundVideo = await this.courseService.findVideoByUrl(url);
    if (!foundVideo) throw new NotFoundError('Video was not found!');
    await this.courseService.updateVideo(newVideoData, foundVideo);
    return { video: foundVideo };
  }

  @Put('update/:courseId')
  async updateCourse(
    @Param('courseId') courseId: number,
    @Body() newCourseData: CourseUpdateDto,
  ) {
    const foundCourse = await this.courseService.findCourseById(courseId);
    if (!foundCourse) throw new NotFoundError('Course was not found!');
    await this.courseService.updateCourse(newCourseData, foundCourse);
    return { course: foundCourse };
  }
  @Put('update/section/:sectionId')
  async updateSection(
    @Param('sectionId') sectionId: number,
    @Body() newSectionData: SectionUpdateDto,
  ) {
    const foundSection = await this.courseService.findSectionById(sectionId);
    if (!foundSection) throw new NotFoundError('Section was not found!');
    await this.courseService.updateSection(newSectionData, foundSection);
    return { section: foundSection };
  }
  @Put('update/video/:videoId')
  async updateVideo(
    @Param('videoId') videoId: number,
    @Body() newVideoData: SectionUpdateDto,
  ) {
    const foundVideo = await this.courseService.findVideoById(videoId);
    if (!foundVideo) throw new NotFoundError('Video was not found!');
    await this.courseService.updateVideo(newVideoData, foundVideo);
    return { video: foundVideo };
  }

  @Delete('/delete/course/:courseId')
  async deleteCourse(@Param('courseId') courseId: number) {
    const foundCourse = await this.courseService.findCourseById(courseId);
    if (!foundCourse) throw new NotFoundError('Video was not found!');
    await this.courseService.deleteCourse(courseId);
    return {};
  }
  @Put('/update/sections/:courseId')
  async addSectionToCourse(
    @Param('courseId') courseId: number,
    @Body() courseToUpdate: CreateCourseDto,
  ) {
    const foundCourse = await this.courseService.findCourseById(courseId);
    if (!foundCourse) throw new NotFoundError('Video was not found!');
    await this.courseService.addSectionToCourse(foundCourse, courseToUpdate);
  }

  @Post('uploadurl')
  async getSingleUploadUrl(
    @Body('urls') urls: string[],
    @Body('userId') userId: number,
  ) {
    if (!urls.length) {
      throw new BadRequestError('No filename was provided!');
    }
    const user = await this.user.findById(userId);
    if (!user) throw new NotFoundError('User not found!');
    const uploadUrls = {};
    const urlGenerator = urls.map(async (url) => {
      const uploadUrl = await this.courseService.getAWSLink(url, userId);
      return { title: url, url: uploadUrl };
    });
    for await (const url of urlGenerator) {
      uploadUrls[url.title] = url.url;
    }

    return { urls: uploadUrls };
  }
}
