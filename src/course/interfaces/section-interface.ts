import { Video } from './video-interface';

export interface Section {
  title: string;
  videos: Video[];
  order: number;
}
