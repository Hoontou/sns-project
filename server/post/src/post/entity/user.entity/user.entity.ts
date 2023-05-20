import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Post } from '../post.entity';
import { Cocomment } from '../cocomment.entity';
import { Comment } from '../comment.entity';
import { Userinfo } from './userinfo.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

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

  @OneToOne(() => Userinfo)
  userinfo: Userinfo;
}
