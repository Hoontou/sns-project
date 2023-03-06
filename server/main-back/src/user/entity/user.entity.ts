import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Comment } from 'src/post/entity/comment.entity';
import { Post } from 'src/post/entity/post.entity';
import { CoComment } from 'src/post/entity/cocomment.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
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

  @OneToMany(() => CoComment, (cocomment) => cocomment.user)
  cocomments: CoComment[]; //유저는 대댓 여러개 쓸 수 있음.
}
