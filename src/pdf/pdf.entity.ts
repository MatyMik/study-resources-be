import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class Pdf extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  numPages: number;

  @Column({ default: 0 })
  lastPageRead: number;

  @Column({ nullable: false })
  fileName: string;

  @Column({ nullable: false })
  url: string;
}
