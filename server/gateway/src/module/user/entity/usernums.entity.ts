import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Usernums extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  follower: number;

  @Column({ default: 0 })
  following: number;

  @Column({ default: 0 })
  postcount: number;

  //유저테이블과 포린키 연결하고 cascade 삭제 설정.
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;
}
