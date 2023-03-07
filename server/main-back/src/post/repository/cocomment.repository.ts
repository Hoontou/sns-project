import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Cocomment } from '../entity/cocomment.entity';

@Injectable()
export class CoCommentTable {
  constructor(
    @InjectRepository(Cocomment)
    public db: Repository<Cocomment>,
  ) {}
}
