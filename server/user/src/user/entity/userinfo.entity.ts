import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Userinfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  follower: number;

  @Column({ default: 0 })
  following: number;

  @Column({ default: 0 })
  postcount: number;

  @Column({ default: '' })
  introduce: string;

  @Column({ default: '' })
  img: string;

  //유저테이블과 포린키 연결하고 cascade 삭제 설정.
  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
