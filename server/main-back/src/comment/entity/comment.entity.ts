import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Post extends BaseEntity {
  @PrimaryColumn()
  post_id: string; //post objectId를 내가 넣어줘야함. 자동생성 아님.

  @Column()
  comment: string;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[]; //유저는 댓글 여러개 쓸 수 있음.
}

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comment: string;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;

  //유저테이블, 포스트테이블과 포린키 연결하고 cascade 삭제 설정.
  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Post;

  @OneToMany(() => CoComment, (cocomment) => cocomment.comment)
  cocomments: CoComment[]; //유저는 댓글 여러개 쓸 수 있음
}

@Entity()
export class CoComment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cocomment: string;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;

  //유저테이블, 포스트테이블과 포린키 연결하고 cascade 삭제 설정.
  @ManyToOne(() => User, (user) => user.cocomments, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.cocomments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  comment: Comment;
}
