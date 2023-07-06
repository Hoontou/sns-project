import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Userinfo } from '../entity/userinfo.entity';
import { crypter } from 'src/common/crypter';
import { pgdb } from 'src/configs/pg';

@Injectable()
export class UserinfoTable {
  private logger = new Logger('UserinfoTable');
  constructor(
    @InjectRepository(Userinfo)
    public readonly db: Repository<Userinfo>,
    private dataSource: DataSource,
  ) {}

  changeUsername(userId: string, username: string) {
    const query = `
    UPDATE public.userinfo
    SET username = '${username}'
    WHERE "userId" = ${crypter.decrypt(userId)};
    `;
    return pgdb.client.query(query);
  }

  changeIntro(userId: string, intro: string) {
    const query = `
    UPDATE public.userinfo
    SET introduce = '${intro}'
    WHERE "userId" = ${crypter.decrypt(userId)};
    `;
    return pgdb.client.query(query);
  }
  setImg(userId: string, img: string) {
    const query = `
    UPDATE public.userinfo
    SET img = '${img}'
    WHERE "userId" = ${crypter.decrypt(userId)};
    `;
    return pgdb.client.query(query);
  }
}
