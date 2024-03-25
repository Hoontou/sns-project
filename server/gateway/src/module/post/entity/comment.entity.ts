import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  //JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { Cocomment } from './cocomment.entity';
import { User } from '../../user/entity/user.entity';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comment: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  cocommentcount: number;

  @CreateDateColumn()
  createdat: Date;

  // //유저테이블과 포린키 연결하고 cascade 삭제 설정.
  // @OneToOne(() => User, {
  //   onDelete: 'CASCADE',
  //   nullable: true,
  // })
  // @JoinColumn()
  // taggeduser: User;

  //유저테이블, 포스트테이블과 포린키 연결하고 cascade 삭제 설정.
  @ManyToOne(() => User, (user) => user.comments)
  //@JoinColumn()
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'SET NULL' })
  //@JoinColumn()
  post: Post;

  @OneToMany(() => Cocomment, (cocomment) => cocomment.comment)
  cocomments: Cocomment[]; //유저는 댓글 여러개 쓸 수 있음
}
