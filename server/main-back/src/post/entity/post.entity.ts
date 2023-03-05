import {
  Entity,
  BaseEntity,
  Column,
  //JoinColumn,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { Comment } from './comment.entity';

@Entity()
export class Post extends BaseEntity {
  @PrimaryColumn()
  _id: string; //post objectId를 내가 넣어줘야함. 자동생성 아님.

  // @Column()
  // title: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  commentCount: number;

  // @CreateDateColumn()
  // createdAt: Date;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  //@JoinColumn()
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[]; //Post는 댓글 여러개 가지고 있음.
}
