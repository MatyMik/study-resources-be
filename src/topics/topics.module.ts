import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';

@Module({
  providers: [TopicsService]
})
export class TopicsModule {}
