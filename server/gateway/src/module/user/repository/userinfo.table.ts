import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Userinfo } from '../entity/userinfo.entity';
import { pgdb } from '../../../configs/postgres';

@Injectable()
export class UserinfoTable {
  private logger = new Logger('UserinfoTable');
  constructor(
    @InjectRepository(Userinfo)
    public readonly db: Repository<Userinfo>,
  ) {}

  changeUsername(data: { userId: number; username: string }) {
    const query = `
    UPDATE public.userinfo
    SET username = '${data.username}'
    WHERE "userId" = ${data.userId};
    `;

    return pgdb.client.query(query);
  }

  changeIntro(data: { userId: number; intro: string }) {
    const query = `
    UPDATE public.userinfo
    SET introduce = '${data.intro}'
    WHERE "userId" = ${data.userId};
    `;

    return pgdb.client.query(query);
  }

  changeIntroduceName(data: { userId: number; introduceName: string }) {
    const query = `
    UPDATE public.userinfo
    SET introduce_name = '${data.introduceName}'
    WHERE "userId" = ${data.userId};
    `;

    //유저탐색을 위해 엘라스틱에서도 수정
    return pgdb.client.query(query);
  }
  changeImg(data: { userId: number; img: string }) {
    const query = `
    UPDATE public.userinfo
    SET img = '${data.img}'
    WHERE "userId" = ${data.userId};
    `;

    return pgdb.client.query(query);
  }

  async getUserIdsByUsernames(usernames: string[]) {
    const parsedString = "'" + usernames.join("', '") + "'";
    console.log(parsedString);
    const query = `
    SELECT ui."userId"
    FROM public.userinfo AS ui
    WHERE ui.username IN (${parsedString});
    `;

    const result = await pgdb.client.query(query);
    console.log(result.rows);

    return result.rows;
  }
}
