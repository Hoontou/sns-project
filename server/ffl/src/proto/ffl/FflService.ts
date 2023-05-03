// Original file: src/proto/ffl.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CheckFollowedReq as _ffl_CheckFollowedReq, CheckFollowedReq__Output as _ffl_CheckFollowedReq__Output } from '../ffl/CheckFollowedReq';
import type { CheckFollowedRes as _ffl_CheckFollowedRes, CheckFollowedRes__Output as _ffl_CheckFollowedRes__Output } from '../ffl/CheckFollowedRes';
import type { CheckLikedReq as _ffl_CheckLikedReq, CheckLikedReq__Output as _ffl_CheckLikedReq__Output } from '../ffl/CheckLikedReq';
import type { CheckLikedRes as _ffl_CheckLikedRes, CheckLikedRes__Output as _ffl_CheckLikedRes__Output } from '../ffl/CheckLikedRes';

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
  
}

export interface FflServiceHandlers extends grpc.UntypedServiceImplementation {
  CheckFollowed: grpc.handleUnaryCall<_ffl_CheckFollowedReq__Output, _ffl_CheckFollowedRes>;
  
  CheckLiked: grpc.handleUnaryCall<_ffl_CheckLikedReq__Output, _ffl_CheckLikedRes>;
  
}

export interface FflServiceDefinition extends grpc.ServiceDefinition {
  CheckFollowed: MethodDefinition<_ffl_CheckFollowedReq, _ffl_CheckFollowedRes, _ffl_CheckFollowedReq__Output, _ffl_CheckFollowedRes__Output>
  CheckLiked: MethodDefinition<_ffl_CheckLikedReq, _ffl_CheckLikedRes, _ffl_CheckLikedReq__Output, _ffl_CheckLikedRes__Output>
}
