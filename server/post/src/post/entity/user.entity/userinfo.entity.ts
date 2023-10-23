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

  @Column({ unique: true })
  username: string;

  @Column({ default: '' })
  introduce: string;

  @Column({ default: '' })
  img: string;

  @Column({ default: '' })
  introduce_name: string;

  //유저테이블과 포린키 연결하고 cascade 삭제 설정.
  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
