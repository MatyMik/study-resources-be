import {
  Body,
  Controller,
  Get,
  Query,
  Post,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { BadRequestError } from '../errors/bad-request-error';
import { ArticleDto } from './dto/create-article-dto';
import { ArticleService } from './article.service';
import { ArticleUpdateDto } from './dto/article-update-dto';
import { NotFoundError } from '../errors/not-found-error';
import { TopicsService } from '../topics/topics.service';

@Controller('article')
export class ArticleController {
  constructor(
    private articleService: ArticleService,
    private topicService: TopicsService,
  ) {}
  @Get('all/:topicId')
  async findAllArticles(
    @Param('topicId') topicId: number,
    @Query('page') page: number,
    @Query('itemsPerPage') itemsPerPage: number,
  ) {
    const topic = await this.topicService.findTopicById(topicId);
    if (!topic) throw new NotFoundError('No topic found!');
    const resources = await this.articleService.findAllArticlesInTopic(
      topic,
      page,
      itemsPerPage,
    );
    return { resources };
  }

  @Get(':articleId')
  async findOneArticle(@Param('articleId') articleId: number) {
    return await this.articleService.findArticleById(articleId);
  }

  @Post('add')
  async saveArticle(@Body('articleDetails') articleData: ArticleDto) {
    if (!articleData) throw new BadRequestError('Not enough data!');
    const { url, title, topicId } = articleData;
    if (!title || !url) throw new BadRequestError('Not enough data!');
    const topic = await this.topicService.findTopicById(topicId);
    if (!topic) throw new NotFoundError('Topic does not exist!');
    const articleDetails = await this.articleService.saveOneArticle(
      articleData,
      topic,
    );
    return { articleDetails };
  }

  @Put('update/:articleId')
  async updateArticle(
    @Param('articleId') articleId: number,
    article: ArticleUpdateDto,
  ) {
    const foundArticle = await this.articleService.findArticleById(articleId);
    if (!foundArticle) throw new NotFoundError('No article found to update!');
    return await this.articleService.updateArticle(foundArticle, article);
  }

  @Delete('delete/:articleId')
  async deleteArticle(@Param('articleId') articleId: number) {
    const foundArticle = await this.articleService.findArticleById(articleId);
    if (!foundArticle) throw new NotFoundError('No article found to update!');
    return await this.articleService.deleteArticle(articleId);
  }
}
