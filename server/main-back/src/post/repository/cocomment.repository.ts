import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CoComment } from '../entity/cocomment.entity';

@Injectable()
export class CoCommentTable {
  constructor(
    @InjectRepository(CoComment)
    public db: Repository<CoComment>,
  ) {}
}
