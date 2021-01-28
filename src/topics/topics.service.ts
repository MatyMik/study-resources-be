import { Injectable } from '@nestjs/common';
import { Topic } from './topic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../authentication/user.entity';
import { TopicUpdateDto } from './dto/topic-update-dto';

@Injectable()
export class TopicsService {
  constructor(@InjectRepository(Topic) private topic: Repository<Topic>) {}

  async getTopics(userId: number) {
    return await this.topic.find({
      where: { user: userId },
      order: { lastActive: 'DESC' },
    });
  }

  async findByTitle(title: string, user: User) {
    const [topic] = await this.topic.find({ where: { title, user } });
    return topic;
  }

  async addTopic(title, user: User) {
    const newTopic = Topic.create();
    newTopic.title = title;
    newTopic.user = user;
    const [savedTopic] = await this.topic.save<Topic>([newTopic]);
    return savedTopic;
  }

  async findTopicById(topicId: number) {
    const [topic] = await this.topic.find({ id: topicId });
    return topic;
  }

  async updateTopic(newTopicFields: TopicUpdateDto, currentTopic: Topic) {
    currentTopic.title = newTopicFields.title || currentTopic.title;
    currentTopic.lastActive =
      newTopicFields.lastActive || currentTopic.lastActive;
    const [updatedTopic] = await this.topic.save<Topic>([currentTopic]);
    return updatedTopic;
  }

  async deleteTopic(topicId: number) {
    return await this.topic.delete({ id: topicId });
  }
}
