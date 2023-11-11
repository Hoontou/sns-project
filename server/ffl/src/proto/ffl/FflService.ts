// Original file: src/proto/ffl.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CheckFollowedReq as _ffl_CheckFollowedReq, CheckFollowedReq__Output as _ffl_CheckFollowedReq__Output } from '../ffl/CheckFollowedReq';
import type { CheckFollowedRes as _ffl_CheckFollowedRes, CheckFollowedRes__Output as _ffl_CheckFollowedRes__Output } from '../ffl/CheckFollowedRes';
import type { CheckLikedReq as _ffl_CheckLikedReq, CheckLikedReq__Output as _ffl_CheckLikedReq__Output } from '../ffl/CheckLikedReq';
import type { CheckLikedRes as _ffl_CheckLikedRes, CheckLikedRes__Output as _ffl_CheckLikedRes__Output } from '../ffl/CheckLikedRes';
import type { GetCocommentLikedReq as _ffl_GetCocommentLikedReq, GetCocommentLikedReq__Output as _ffl_GetCocommentLikedReq__Output } from '../ffl/GetCocommentLikedReq';
import type { GetCocommentLikedRes as _ffl_GetCocommentLikedRes, GetCocommentLikedRes__Output as _ffl_GetCocommentLikedRes__Output } from '../ffl/GetCocommentLikedRes';
import type { GetCommentLikedReq as _ffl_GetCommentLikedReq, GetCommentLikedReq__Output as _ffl_GetCommentLikedReq__Output } from '../ffl/GetCommentLikedReq';
import type { GetCommentLikedRes as _ffl_GetCommentLikedRes, GetCommentLikedRes__Output as _ffl_GetCommentLikedRes__Output } from '../ffl/GetCommentLikedRes';
import type { GetUserIdsReq as _ffl_GetUserIdsReq, GetUserIdsReq__Output as _ffl_GetUserIdsReq__Output } from '../ffl/GetUserIdsReq';
import type { GetUserIdsRes as _ffl_GetUserIdsRes, GetUserIdsRes__Output as _ffl_GetUserIdsRes__Output } from '../ffl/GetUserIdsRes';
import type { SearchUserFflReq as _ffl_SearchUserFflReq, SearchUserFflReq__Output as _ffl_SearchUserFflReq__Output } from '../ffl/SearchUserFflReq';
import type { SearchUserFflRes as _ffl_SearchUserFflRes, SearchUserFflRes__Output as _ffl_SearchUserFflRes__Output } from '../ffl/SearchUserFflRes';

export interface FflServiceClient extends grpc.Client {
  CheckFollowed(argument: _ffl_CheckFollowedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_CheckFollowedRes__Output>): grpc.ClientUnaryCall;
  CheckFollowed(argument: _ffl_CheckFollowedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_CheckFollowedRes__Output>): grpc.ClientUnaryCall;
  CheckFollowed(argument: _ffl_CheckFollowedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_CheckFollowedRes__Output>): grpc.ClientUnaryCall;
  CheckFollowed(argument: _ffl_CheckFollowedReq, callback: grpc.requestCallback<_ffl_CheckFollowedRes__Output>): grpc.ClientUnaryCall;
  checkFollowed(argument: _ffl_CheckFollowedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_CheckFollowedRes__Output>): grpc.ClientUnaryCall;
  checkFollowed(argument: _ffl_CheckFollowedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_CheckFollowedRes__Output>): grpc.ClientUnaryCall;
  checkFollowed(argument: _ffl_CheckFollowedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_CheckFollowedRes__Output>): grpc.ClientUnaryCall;
  checkFollowed(argument: _ffl_CheckFollowedReq, callback: grpc.requestCallback<_ffl_CheckFollowedRes__Output>): grpc.ClientUnaryCall;
  
  CheckLiked(argument: _ffl_CheckLikedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_CheckLikedRes__Output>): grpc.ClientUnaryCall;
  CheckLiked(argument: _ffl_CheckLikedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_CheckLikedRes__Output>): grpc.ClientUnaryCall;
  CheckLiked(argument: _ffl_CheckLikedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_CheckLikedRes__Output>): grpc.ClientUnaryCall;
  CheckLiked(argument: _ffl_CheckLikedReq, callback: grpc.requestCallback<_ffl_CheckLikedRes__Output>): grpc.ClientUnaryCall;
  checkLiked(argument: _ffl_CheckLikedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_CheckLikedRes__Output>): grpc.ClientUnaryCall;
  checkLiked(argument: _ffl_CheckLikedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_CheckLikedRes__Output>): grpc.ClientUnaryCall;
  checkLiked(argument: _ffl_CheckLikedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_CheckLikedRes__Output>): grpc.ClientUnaryCall;
  checkLiked(argument: _ffl_CheckLikedReq, callback: grpc.requestCallback<_ffl_CheckLikedRes__Output>): grpc.ClientUnaryCall;
  
  GetCocommentLiked(argument: _ffl_GetCocommentLikedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetCocommentLikedRes__Output>): grpc.ClientUnaryCall;
  GetCocommentLiked(argument: _ffl_GetCocommentLikedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_GetCocommentLikedRes__Output>): grpc.ClientUnaryCall;
  GetCocommentLiked(argument: _ffl_GetCocommentLikedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetCocommentLikedRes__Output>): grpc.ClientUnaryCall;
  GetCocommentLiked(argument: _ffl_GetCocommentLikedReq, callback: grpc.requestCallback<_ffl_GetCocommentLikedRes__Output>): grpc.ClientUnaryCall;
  getCocommentLiked(argument: _ffl_GetCocommentLikedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetCocommentLikedRes__Output>): grpc.ClientUnaryCall;
  getCocommentLiked(argument: _ffl_GetCocommentLikedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_GetCocommentLikedRes__Output>): grpc.ClientUnaryCall;
  getCocommentLiked(argument: _ffl_GetCocommentLikedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetCocommentLikedRes__Output>): grpc.ClientUnaryCall;
  getCocommentLiked(argument: _ffl_GetCocommentLikedReq, callback: grpc.requestCallback<_ffl_GetCocommentLikedRes__Output>): grpc.ClientUnaryCall;
  
  GetCommentLiked(argument: _ffl_GetCommentLikedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetCommentLikedRes__Output>): grpc.ClientUnaryCall;
  GetCommentLiked(argument: _ffl_GetCommentLikedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_GetCommentLikedRes__Output>): grpc.ClientUnaryCall;
  GetCommentLiked(argument: _ffl_GetCommentLikedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetCommentLikedRes__Output>): grpc.ClientUnaryCall;
  GetCommentLiked(argument: _ffl_GetCommentLikedReq, callback: grpc.requestCallback<_ffl_GetCommentLikedRes__Output>): grpc.ClientUnaryCall;
  getCommentLiked(argument: _ffl_GetCommentLikedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetCommentLikedRes__Output>): grpc.ClientUnaryCall;
  getCommentLiked(argument: _ffl_GetCommentLikedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_GetCommentLikedRes__Output>): grpc.ClientUnaryCall;
  getCommentLiked(argument: _ffl_GetCommentLikedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetCommentLikedRes__Output>): grpc.ClientUnaryCall;
  getCommentLiked(argument: _ffl_GetCommentLikedReq, callback: grpc.requestCallback<_ffl_GetCommentLikedRes__Output>): grpc.ClientUnaryCall;
  
  GetUserIds(argument: _ffl_GetUserIdsReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetUserIdsRes__Output>): grpc.ClientUnaryCall;
  GetUserIds(argument: _ffl_GetUserIdsReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_GetUserIdsRes__Output>): grpc.ClientUnaryCall;
  GetUserIds(argument: _ffl_GetUserIdsReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetUserIdsRes__Output>): grpc.ClientUnaryCall;
  GetUserIds(argument: _ffl_GetUserIdsReq, callback: grpc.requestCallback<_ffl_GetUserIdsRes__Output>): grpc.ClientUnaryCall;
  getUserIds(argument: _ffl_GetUserIdsReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetUserIdsRes__Output>): grpc.ClientUnaryCall;
  getUserIds(argument: _ffl_GetUserIdsReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_GetUserIdsRes__Output>): grpc.ClientUnaryCall;
  getUserIds(argument: _ffl_GetUserIdsReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetUserIdsRes__Output>): grpc.ClientUnaryCall;
  getUserIds(argument: _ffl_GetUserIdsReq, callback: grpc.requestCallback<_ffl_GetUserIdsRes__Output>): grpc.ClientUnaryCall;
  
  SearchUserFfl(argument: _ffl_SearchUserFflReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_SearchUserFflRes__Output>): grpc.ClientUnaryCall;
  SearchUserFfl(argument: _ffl_SearchUserFflReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_SearchUserFflRes__Output>): grpc.ClientUnaryCall;
  SearchUserFfl(argument: _ffl_SearchUserFflReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_SearchUserFflRes__Output>): grpc.ClientUnaryCall;
  SearchUserFfl(argument: _ffl_SearchUserFflReq, callback: grpc.requestCallback<_ffl_SearchUserFflRes__Output>): grpc.ClientUnaryCall;
  searchUserFfl(argument: _ffl_SearchUserFflReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_SearchUserFflRes__Output>): grpc.ClientUnaryCall;
  searchUserFfl(argument: _ffl_SearchUserFflReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_SearchUserFflRes__Output>): grpc.ClientUnaryCall;
  searchUserFfl(argument: _ffl_SearchUserFflReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_SearchUserFflRes__Output>): grpc.ClientUnaryCall;
  searchUserFfl(argument: _ffl_SearchUserFflReq, callback: grpc.requestCallback<_ffl_SearchUserFflRes__Output>): grpc.ClientUnaryCall;
  
}

export interface FflServiceHandlers extends grpc.UntypedServiceImplementation {
  CheckFollowed: grpc.handleUnaryCall<_ffl_CheckFollowedReq__Output, _ffl_CheckFollowedRes>;
  
  CheckLiked: grpc.handleUnaryCall<_ffl_CheckLikedReq__Output, _ffl_CheckLikedRes>;
  
  GetCocommentLiked: grpc.handleUnaryCall<_ffl_GetCocommentLikedReq__Output, _ffl_GetCocommentLikedRes>;
  
  GetCommentLiked: grpc.handleUnaryCall<_ffl_GetCommentLikedReq__Output, _ffl_GetCommentLikedRes>;
  
  GetUserIds: grpc.handleUnaryCall<_ffl_GetUserIdsReq__Output, _ffl_GetUserIdsRes>;
  
  SearchUserFfl: grpc.handleUnaryCall<_ffl_SearchUserFflReq__Output, _ffl_SearchUserFflRes>;
  
}

export interface FflServiceDefinition extends grpc.ServiceDefinition {
  CheckFollowed: MethodDefinition<_ffl_CheckFollowedReq, _ffl_CheckFollowedRes, _ffl_CheckFollowedReq__Output, _ffl_CheckFollowedRes__Output>
  CheckLiked: MethodDefinition<_ffl_CheckLikedReq, _ffl_CheckLikedRes, _ffl_CheckLikedReq__Output, _ffl_CheckLikedRes__Output>
  GetCocommentLiked: MethodDefinition<_ffl_GetCocommentLikedReq, _ffl_GetCocommentLikedRes, _ffl_GetCocommentLikedReq__Output, _ffl_GetCocommentLikedRes__Output>
  GetCommentLiked: MethodDefinition<_ffl_GetCommentLikedReq, _ffl_GetCommentLikedRes, _ffl_GetCommentLikedReq__Output, _ffl_GetCommentLikedRes__Output>
  GetUserIds: MethodDefinition<_ffl_GetUserIdsReq, _ffl_GetUserIdsRes, _ffl_GetUserIdsReq__Output, _ffl_GetUserIdsRes__Output>
  SearchUserFfl: MethodDefinition<_ffl_SearchUserFflReq, _ffl_SearchUserFflRes, _ffl_SearchUserFflReq__Output, _ffl_SearchUserFflRes__Output>
}
