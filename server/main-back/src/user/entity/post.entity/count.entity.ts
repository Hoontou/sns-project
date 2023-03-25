import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { Cocomment } from './cocomment.entity';

@Entity()
export class Commentnums extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  cocommentcount: number;

  @OneToOne(() => Comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  comment: Comment;
}

@Entity()
export class Cocommentnums extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  likes: number;

  @OneToOne(() => Cocomment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  cocomment: Cocomment;
}
