import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  //JoinColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { Comment } from './comment.entity';

@Entity()
export class Cocomment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cocomment: string;

  @Column({ default: 0 })
  likes: number;

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
  @ManyToOne(() => User, (user) => user.cocomments)
  //@JoinColumn()
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.cocomments)
  //@JoinColumn()
  comment: Comment;
}
