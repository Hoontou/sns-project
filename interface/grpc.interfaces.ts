import { MetadataDto } from '.';

//metadata
export interface GetMetadatasRes {
  metadatas: MetadataDto[];
}

//user
export interface GetUsernumsRes {
  follower: number;
  following: number;
  postcount: number;
}
export interface UserinfoWithNums {
  follower: number;
  following: number;
  postcount: number;
  img: string;
  introduce: string;
  username: string;
}
