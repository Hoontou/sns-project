import { Injectable, Logger } from '@nestjs/common';
import { Usernums } from '../entity/usernums.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { crypter } from 'src/common/crypter';
import { pgdb } from 'src/configs/pg';
import { UploadMessage } from 'sns-interfaces';

@Injectable()
export class UsernumsTable {
  private logger = new Logger('UsernumsTable');
  constructor(
    @InjectRepository(Usernums)
    public readonly db: Repository<Usernums>,
  ) {}
  async addFollow(data: { userTo: string; userFrom: string }) {
    const to = crypter.decrypt(data.userTo);
    const from = crypter.decrypt(data.userFrom);

    const queryTo = `
    UPDATE public.usernums
    SET follower = follower + 1
    WHERE "userId" = ${to};
    `;
    const queryFrom = `
    UPDATE public.usernums
    SET following = following + 1
    WHERE "userId" = ${from};
    `;

    return Promise.all([
      pgdb.client.query(queryTo),
      pgdb.client.query(queryFrom),
    ]);
  }

  async removeFollow(data: { userTo: string; userFrom: string }) {
    const to = crypter.decrypt(data.userTo);
    const from = crypter.decrypt(data.userFrom);

    const queryTo = `
    UPDATE public.usernums
    SET follower = follower- 1
    WHERE "userId" = ${to};
    `;
    const queryFrom = `
    UPDATE public.usernums
    SET following = following - 1
    WHERE "userId" = ${from};
    `;

    return Promise.all([
      pgdb.client.query(queryTo),
      pgdb.client.query(queryFrom),
    ]);
  }

  async addPostCount(content: UploadMessage) {
    const query = `
    UPDATE public.usernums
    SET postcount = postcount + 1
    WHERE "userId" = ${crypter.decrypt(content.userId)};
    `;
    return pgdb.client.query(query);
  }
}
