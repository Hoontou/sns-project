import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Userinfo } from '../entity/userinfo.entity';
import { crypter } from 'src/common/crypter';
import { pgdb } from 'src/configs/pg';
import { elastic } from 'src/configs/elasticsearch';

@Injectable()
export class UserinfoTable {
  private logger = new Logger('UserinfoTable');
  constructor(
    @InjectRepository(Userinfo)
    public readonly db: Repository<Userinfo>,
    private dataSource: DataSource,
  ) {}

  changeUsername(userId: string, username: string) {
    const decId = crypter.decrypt(userId);

    const query = `
    UPDATE public.userinfo
    SET username = '${username}'
    WHERE "userId" = ${decId};
    `;

    //유저탐색을 위해 엘라스틱에서도 수정
    return Promise.all([
      pgdb.client.query(query),
      elastic.client.update({
        index: elastic.SnsUsersIndex,
        id: decId,
        doc: {
          username,
        },
      }),
    ]);
  }

  changeIntro(userId: string, intro: string) {
    const decId = crypter.decrypt(userId);

    const query = `
    UPDATE public.userinfo
    SET introduce = '${intro}'
    WHERE "userId" = ${decId};
    `;

    console.log(decId);

    //유저탐색을 위해 엘라스틱에서도 수정
    return Promise.all([
      pgdb.client.query(query),
      elastic.client.update({
        index: elastic.SnsUsersIndex,
        id: decId,
        doc: {
          introduce: intro,
        },
      }),
    ]);
  }
  changeIntroduceName(userId: string, introduceName: string) {
    const decId = crypter.decrypt(userId);

    const query = `
    UPDATE public.userinfo
    SET introduce_name = '${introduceName}'
    WHERE "userId" = ${decId};
    `;

    //유저탐색을 위해 엘라스틱에서도 수정
    return Promise.all([
      pgdb.client.query(query),
      elastic.client.update({
        index: elastic.SnsUsersIndex,
        id: decId,
        doc: {
          introduceName: introduceName,
        },
      }),
    ]);
  }
  setImg(userId: string, img: string) {
    const decId = crypter.decrypt(userId);

    const query = `
    UPDATE public.userinfo
    SET img = '${img}'
    WHERE "userId" = ${decId};
    `;

    //유저탐색을 위해 엘라스틱에서도 수정
    return Promise.all([
      pgdb.client.query(query),
      elastic.client.update({
        index: elastic.SnsUsersIndex,
        id: decId,
        doc: {
          img,
        },
      }),
    ]);
  }
}
