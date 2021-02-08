import { Video } from '../entities';

export class SectionAddDto {
  title: string;
  order: number;
  videos: Video[];
}
