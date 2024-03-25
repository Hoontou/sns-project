import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Userinfo } from '../entity/userinfo.entity';
import { crypter } from 'src/common/crypter';
import { elastic } from 'src/configs/elasticsearch';
import { pgdb } from '../../../configs/postgres';

@Injectable()
export class UserinfoTable {
  private logger = new Logger('UserinfoTable');
  constructor(
    @InjectRepository(Userinfo)
    public readonly db: Repository<Userinfo>,
    private dataSource: DataSource,
  ) {}

  changeUsername(data: { userId: string; username: string }) {
    const query = `
    UPDATE public.userinfo
    SET username = '${data.username}'
    WHERE "userId" = ${data.userId};
    `;

    return pgdb.client.query(query);
  }

  changeIntro(data: { userId: string; intro: string }) {
    const query = `
    UPDATE public.userinfo
    SET introduce = '${data.intro}'
    WHERE "userId" = ${data.userId};
    `;

    return pgdb.client.query(query);
  }

  changeIntroduceName(data: { userId: string; introduceName: string }) {
    const query = `
    UPDATE public.userinfo
    SET introduce_name = '${data.introduceName}'
    WHERE "userId" = ${data.userId};
    `;

    //유저탐색을 위해 엘라스틱에서도 수정
    return pgdb.client.query(query);
  }
  changeImg(data: { userId: string; img: string }) {
    const query = `
    UPDATE public.userinfo
    SET img = '${data.img}'
    WHERE "userId" = ${data.userId};
    `;

    return pgdb.client.query(query);
  }
}
