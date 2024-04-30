import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { Userinfo } from './userinfo.entity';
import { Post } from '../../post/repository/entity/post.entity';
import { Cocomment } from '../../post/repository/entity/cocomment.entity';
import { Comment } from '../../post/repository/entity/comment.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Index()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[]; // 유저는 여러개 글 가질수 있음.

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[]; //유저는 댓글 여러개 쓸 수 있음.

  @OneToMany(() => Cocomment, (cocomment) => cocomment.user)
  cocomments: Cocomment[]; //유저는 대댓 여러개 쓸 수 있음.

  @OneToOne(() => Userinfo, (userinfo) => userinfo.user)
  userinfo: Userinfo;
}
