import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
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
  post_id: string; //post objectId를 내가 넣어줘야함. 자동생성 아님.

  @Column()
  comment: string;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  //@JoinColumn()
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[]; //Post는 댓글 여러개 가지고 있음.
}
