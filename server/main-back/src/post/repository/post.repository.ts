import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Post } from '../entity/post.entity';

@Injectable()
export class PostTable {
  constructor(
    @InjectRepository(Post)
    public db: Repository<Post>,
  ) {}
}
