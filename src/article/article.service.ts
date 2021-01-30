import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleDto } from './dto/create-article-dto';
import { Article } from './article.entity';
import { ArticleUpdateDto } from './dto/article-update-dto';
import { Topic } from '../topics/topic.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private article: Repository<Article>,
  ) {}

  async saveOneArticle(articleData: ArticleDto, topic: Topic) {
    const newArticle: Article = Article.create();
    newArticle.title = articleData.title;
    newArticle.topic = topic;
    newArticle.url = articleData.url;
    const [savedArticle] = await this.article.save<Article>([newArticle]);
    return savedArticle;
  }

  async updateArticle(article: Article, newArticleValues: ArticleUpdateDto) {
    article.lastActive = newArticleValues.lastActive || article.lastActive;
    article.title = newArticleValues.title || article.title;
    article.archived = newArticleValues.archived || article.archived;
    const [savedArticle] = await this.article.save<Article>([article]);
    return savedArticle;
  }

  async findArticleById(id: number) {
    const [Article] = await this.article.find({ id });
    return Article;
  }

  async deleteArticle(articleId: number) {
    await this.article.delete(articleId);
  }

  async findAllArticlesInTopic(
    topic: Topic,
    page: number,
    itemsPerPage: number,
    archived: boolean,
  ) {
    const limit = itemsPerPage;
    const offset = (page - 1) * itemsPerPage;
    return await this.article.find({
      where: { topic, archived },
      order: { lastActive: 'DESC' },
      skip: offset,
      take: limit,
    });
  }
}
