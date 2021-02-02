import { Section } from '../interfaces/section-interface';

export class CreateCourseDto {
  topicId: number;
  title: string;
  sections: Section[];
  totalItems: number;
}
