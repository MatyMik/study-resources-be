import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YoutubeDto } from './dto/create-youtube-dto';
import { Youtube } from './youtube.entity';
import { YoutubeUpdateDto } from './dto/youtube-update-dto';
import { Topic } from '../topics/topic.entity';

@Injectable()
export class YoutubeService {
  constructor(
    @InjectRepository(Youtube) private youtube: Repository<Youtube>,
  ) {}

  async saveOneYoutubeLink(articleData: YoutubeDto, topic: Topic) {
    const newArticle: Youtube = Youtube.create();
    newArticle.title = articleData.title;
    newArticle.topic = topic;
    newArticle.url = articleData.url;
    const [savedArticle] = await this.youtube.save<Youtube>([newArticle]);
    return savedArticle;
  }

  async updateYoutubeLink(
    article: Youtube,
    newArticleValues: YoutubeUpdateDto,
  ) {
    article.lastActive = newArticleValues.lastActive || article.lastActive;
    const [savedArticle] = await this.youtube.save<Youtube>([article]);
    return savedArticle;
  }

  async findYoutubeLinkById(id: number) {
    const [Youtube] = await this.youtube.find({ id });
    return Youtube;
  }

  async deleteYoutubeLink(youtubeId: number) {
    await this.youtube.delete(youtubeId);
  }

  async findAllYoutubeLinksInTopic(
    topic: Topic,
    page: number,
    itemsPerPage: number,
    archived: boolean,
  ) {
    const limit = itemsPerPage;
    const offset = (page - 1) * itemsPerPage;
    return await this.youtube.find({
      where: { topic, archived },
      order: { lastActive: 'DESC' },
      skip: offset,
      take: limit,
      cache: true,
    });
  }
}
