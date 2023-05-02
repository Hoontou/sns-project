// Original file: src/proto/ffl.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { GetFollowedReq as _ffl_GetFollowedReq, GetFollowedReq__Output as _ffl_GetFollowedReq__Output } from '../ffl/GetFollowedReq';
import type { GetFollowedRes as _ffl_GetFollowedRes, GetFollowedRes__Output as _ffl_GetFollowedRes__Output } from '../ffl/GetFollowedRes';
import type { GetLikedReq as _ffl_GetLikedReq, GetLikedReq__Output as _ffl_GetLikedReq__Output } from '../ffl/GetLikedReq';
import type { GetLikedRes as _ffl_GetLikedRes, GetLikedRes__Output as _ffl_GetLikedRes__Output } from '../ffl/GetLikedRes';

export interface FflServiceClient extends grpc.Client {
  GetFollowed(argument: _ffl_GetFollowedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetFollowedRes__Output>): grpc.ClientUnaryCall;
  GetFollowed(argument: _ffl_GetFollowedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_GetFollowedRes__Output>): grpc.ClientUnaryCall;
  GetFollowed(argument: _ffl_GetFollowedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetFollowedRes__Output>): grpc.ClientUnaryCall;
  GetFollowed(argument: _ffl_GetFollowedReq, callback: grpc.requestCallback<_ffl_GetFollowedRes__Output>): grpc.ClientUnaryCall;
  getFollowed(argument: _ffl_GetFollowedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetFollowedRes__Output>): grpc.ClientUnaryCall;
  getFollowed(argument: _ffl_GetFollowedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_GetFollowedRes__Output>): grpc.ClientUnaryCall;
  getFollowed(argument: _ffl_GetFollowedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetFollowedRes__Output>): grpc.ClientUnaryCall;
  getFollowed(argument: _ffl_GetFollowedReq, callback: grpc.requestCallback<_ffl_GetFollowedRes__Output>): grpc.ClientUnaryCall;
  
  GetLiked(argument: _ffl_GetLikedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetLikedRes__Output>): grpc.ClientUnaryCall;
  GetLiked(argument: _ffl_GetLikedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_GetLikedRes__Output>): grpc.ClientUnaryCall;
  GetLiked(argument: _ffl_GetLikedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetLikedRes__Output>): grpc.ClientUnaryCall;
  GetLiked(argument: _ffl_GetLikedReq, callback: grpc.requestCallback<_ffl_GetLikedRes__Output>): grpc.ClientUnaryCall;
  getLiked(argument: _ffl_GetLikedReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetLikedRes__Output>): grpc.ClientUnaryCall;
  getLiked(argument: _ffl_GetLikedReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_ffl_GetLikedRes__Output>): grpc.ClientUnaryCall;
  getLiked(argument: _ffl_GetLikedReq, options: grpc.CallOptions, callback: grpc.requestCallback<_ffl_GetLikedRes__Output>): grpc.ClientUnaryCall;
  getLiked(argument: _ffl_GetLikedReq, callback: grpc.requestCallback<_ffl_GetLikedRes__Output>): grpc.ClientUnaryCall;
  
}

export interface FflServiceHandlers extends grpc.UntypedServiceImplementation {
  GetFollowed: grpc.handleUnaryCall<_ffl_GetFollowedReq__Output, _ffl_GetFollowedRes>;
  
  GetLiked: grpc.handleUnaryCall<_ffl_GetLikedReq__Output, _ffl_GetLikedRes>;
  
}

export interface FflServiceDefinition extends grpc.ServiceDefinition {
  GetFollowed: MethodDefinition<_ffl_GetFollowedReq, _ffl_GetFollowedRes, _ffl_GetFollowedReq__Output, _ffl_GetFollowedRes__Output>
  GetLiked: MethodDefinition<_ffl_GetLikedReq, _ffl_GetLikedRes, _ffl_GetLikedReq__Output, _ffl_GetLikedRes__Output>
}
