import { MetadataDto } from '.';

//metadata
export interface GetPostsRes {
  posts: MetadataDto[];
}

//user
export interface GetUsernumsRes {
  follower: number;
  following: number;
  postcount: number;
}
