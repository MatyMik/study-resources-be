export interface Video {
  title: string;
  url: string;
  order: number;
  duration?: number;
  watched?: boolean;
  minutesWatched?: number;
}
