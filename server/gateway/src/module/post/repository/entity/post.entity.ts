import {
  Entity,
  BaseEntity,
  Column,
  //JoinColumn,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../../../user/entity/user.entity';

@Entity()
export class Post extends BaseEntity {
  @PrimaryColumn()
  @Index()
  id: string;
  //post objectId를 내가 넣어줘야함. 자동생성 아님

  @Column()
  title: string;

  @Column({ default: 0 })
  @Index()
  likes: number;

  @Column({ default: 0 })
  commentcount: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User; //포린키, 작성자 uuid

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[]; //Post는 댓글 여러개 가지고 있음.
}
