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
import { YoutubeDto } from './dto/create-youtube-dto';
import { YoutubeService } from './youtube.service';
import { YoutubeUpdateDto } from './dto/youtube-update-dto';
import { NotFoundError } from '../errors/not-found-error';
import { TopicsService } from '../topics/topics.service';

@Controller('youtube')
export class YoutubeController {
  constructor(
    private youtubeService: YoutubeService,
    private topicService: TopicsService,
  ) {}
  @Get('all/:topicId')
  async findAllYoutubeLinks(
    @Param('topicId') topicId: number,
    @Query('page') page: number,
    @Query('itemsPerPage') itemsPerPage: number,
    @Query('archived') archived: boolean,
  ) {
    const topic = await this.topicService.findTopicById(topicId);
    if (!topic) throw new NotFoundError('No topic found!');
    const resources = await this.youtubeService.findAllYoutubeLinksInTopic(
      topic,
      page,
      itemsPerPage,
      archived,
    );
    return { resources };
  }

  @Get(':youtubeId')
  async findOneYoutubeLink(@Param('youtubeId') youtubeId: number) {
    return await this.youtubeService.findYoutubeLinkById(youtubeId);
  }

  @Post('add')
  async saveYoutubeLink(@Body('resourceData') youtubeData: YoutubeDto) {
    if (!youtubeData) throw new BadRequestError('Not enough data!');
    const { url, title, topicId } = youtubeData;
    if (!title || !url) throw new BadRequestError('Not enough data!');
    const topic = await this.topicService.findTopicById(topicId);
    if (!topic) throw new NotFoundError('Topic does not exist!');
    const youtubeDetails = await this.youtubeService.saveOneYoutubeLink(
      youtubeData,
      topic,
    );
    return { youtubeDetails };
  }

  @Put('update/:youtubeId')
  async updateYoutubeLink(
    @Param('youtubeId') youtubeId: number,
    @Body() youtube: YoutubeUpdateDto,
  ) {
    const foundYoutubeLink = await this.youtubeService.findYoutubeLinkById(
      youtubeId,
    );
    if (!foundYoutubeLink)
      throw new NotFoundError('No youtube link found to update!');
    return await this.youtubeService.updateYoutubeLink(
      foundYoutubeLink,
      youtube,
    );
  }

  @Delete('delete/:youtubeId')
  async deleteYoutubeLink(@Param('youtubeId') youtubeId: number) {
    const foundYoutubeLink = await this.youtubeService.findYoutubeLinkById(
      youtubeId,
    );
    if (!foundYoutubeLink)
      throw new NotFoundError('No youtube link found to update!');
    return await this.youtubeService.deleteYoutubeLink(youtubeId);
  }
}
