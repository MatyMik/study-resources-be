import { Section } from '../entities';

export class CreateCourseDto {
  topicId: number;
  title: string;
  sections: Section[];
  totalItems: number;
}
