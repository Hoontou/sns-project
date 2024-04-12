import { Injectable, Logger } from '@nestjs/common';
import { Usernums } from '../entity/usernums.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { crypter } from 'src/common/crypter';
import { pgdb } from '../../../configs/postgres';
import { UploadMessage } from 'sns-interfaces';

@Injectable()
export class UsernumsTable {
  private logger = new Logger('UsernumsTable');
  constructor(
    @InjectRepository(Usernums)
    public readonly db: Repository<Usernums>,
  ) {}
  async addFollow(data: { userTo: number; userFrom: number }) {
    const queryTo = `
    UPDATE public.usernums
    SET follower = follower + 1
    WHERE "userId" = ${data.userTo};
    `;
    const queryFrom = `
    UPDATE public.usernums
    SET following = following + 1
    WHERE "userId" = ${data.userFrom};
    `;

    return Promise.all([
      pgdb.client.query(queryTo),
      pgdb.client.query(queryFrom),
    ]);
  }

  async removeFollow(data: { userTo: number; userFrom: number }) {
    const queryTo = `
    UPDATE public.usernums
    SET follower = follower- 1
    WHERE "userId" = ${data.userTo};
    `;
    const queryFrom = `
    UPDATE public.usernums
    SET following = following - 1
    WHERE "userId" = ${data.userFrom};
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
  async decreasePostCount(data: { userId: string }) {
    const query = `
    UPDATE public.usernums
    SET postcount = postcount - 1
    WHERE "userId" = ${crypter.decrypt(data.userId)};
    `;
    return pgdb.client.query(query);
  }
}
