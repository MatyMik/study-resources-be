import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicDto } from './dto/topic-dto';
import { ResourceExistsError } from '../errors/resource-already-exists-error';
import { AuthenticationService } from '../authentication/authentication.service';
import { TopicUpdateDto } from './dto/topic-update-dto';
import { NotFoundError } from '../errors/not-found-error';

@Controller('topics')
export class TopicsController {
  constructor(
    private topicService: TopicsService,
    private user: AuthenticationService,
  ) {}
  @Get('/alltopics')
  async getTopics(@Query('userId') userId: number) {
    return await this.topicService.getTopics(userId);
  }

  @Post('/add')
  async addTopic(@Body() topic: TopicDto) {
    const { title, userId } = topic;
    const foundUser = await this.user.findById(userId);
    const foundTopic = await this.topicService.findByTitle(title, foundUser);
    if (foundTopic) throw new ResourceExistsError('This topic already exists!');
    return await this.topicService.addTopic(title, foundUser);
  }

  @Put('/update')
  async updateTopic(@Body() topic: TopicUpdateDto) {
    const { topicId } = topic;
    const foundTopic = await this.topicService.findTopicById(topicId);
    if (!foundTopic) throw new NotFoundError('Topic does not exist!');
    const updatedTopic = await this.topicService.updateTopic(topic, foundTopic);
    return updatedTopic;
  }

  @Delete('/:topicId')
  async deleteTopic(@Param('topicId') topicId: number) {
    const foundTopic = await this.topicService.findTopicById(topicId);
    if (!foundTopic) throw new NotFoundError('Topic does not exist!');
    await this.topicService.deleteTopic(topicId);
  }
}
