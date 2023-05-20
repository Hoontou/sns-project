// Original file: src/proto/ffl.proto

export interface GetCommentLikedReq {
  commentIdList?: number[];
  userId?: string;
}

export interface GetCommentLikedReq__Output {
  commentIdList: number[];
  userId: string;
}
