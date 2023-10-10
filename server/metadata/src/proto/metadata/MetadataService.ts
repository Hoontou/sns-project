// Original file: src/proto/metadata.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { GetMetadatasByPostIdReq as _metadata_GetMetadatasByPostIdReq, GetMetadatasByPostIdReq__Output as _metadata_GetMetadatasByPostIdReq__Output } from '../metadata/GetMetadatasByPostIdReq';
import type { GetMetadatasByPostIdRes as _metadata_GetMetadatasByPostIdRes, GetMetadatasByPostIdRes__Output as _metadata_GetMetadatasByPostIdRes__Output } from '../metadata/GetMetadatasByPostIdRes';
import type { GetMetadatasLast3DayReq as _metadata_GetMetadatasLast3DayReq, GetMetadatasLast3DayReq__Output as _metadata_GetMetadatasLast3DayReq__Output } from '../metadata/GetMetadatasLast3DayReq';
import type { GetMetadatasLast3DayRes as _metadata_GetMetadatasLast3DayRes, GetMetadatasLast3DayRes__Output as _metadata_GetMetadatasLast3DayRes__Output } from '../metadata/GetMetadatasLast3DayRes';
import type { getMetadatasReq as _metadata_getMetadatasReq, getMetadatasReq__Output as _metadata_getMetadatasReq__Output } from '../metadata/getMetadatasReq';
import type { getMetadatasRes as _metadata_getMetadatasRes, getMetadatasRes__Output as _metadata_getMetadatasRes__Output } from '../metadata/getMetadatasRes';

export interface MetadataServiceClient extends grpc.Client {
  GetMetadatas(argument: _metadata_getMetadatasReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_getMetadatasRes__Output>): grpc.ClientUnaryCall;
  GetMetadatas(argument: _metadata_getMetadatasReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_metadata_getMetadatasRes__Output>): grpc.ClientUnaryCall;
  GetMetadatas(argument: _metadata_getMetadatasReq, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_getMetadatasRes__Output>): grpc.ClientUnaryCall;
  GetMetadatas(argument: _metadata_getMetadatasReq, callback: grpc.requestCallback<_metadata_getMetadatasRes__Output>): grpc.ClientUnaryCall;
  getMetadatas(argument: _metadata_getMetadatasReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_getMetadatasRes__Output>): grpc.ClientUnaryCall;
  getMetadatas(argument: _metadata_getMetadatasReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_metadata_getMetadatasRes__Output>): grpc.ClientUnaryCall;
  getMetadatas(argument: _metadata_getMetadatasReq, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_getMetadatasRes__Output>): grpc.ClientUnaryCall;
  getMetadatas(argument: _metadata_getMetadatasReq, callback: grpc.requestCallback<_metadata_getMetadatasRes__Output>): grpc.ClientUnaryCall;
  
  GetMetadatasByPostId(argument: _metadata_GetMetadatasByPostIdReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_GetMetadatasByPostIdRes__Output>): grpc.ClientUnaryCall;
  GetMetadatasByPostId(argument: _metadata_GetMetadatasByPostIdReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_metadata_GetMetadatasByPostIdRes__Output>): grpc.ClientUnaryCall;
  GetMetadatasByPostId(argument: _metadata_GetMetadatasByPostIdReq, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_GetMetadatasByPostIdRes__Output>): grpc.ClientUnaryCall;
  GetMetadatasByPostId(argument: _metadata_GetMetadatasByPostIdReq, callback: grpc.requestCallback<_metadata_GetMetadatasByPostIdRes__Output>): grpc.ClientUnaryCall;
  getMetadatasByPostId(argument: _metadata_GetMetadatasByPostIdReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_GetMetadatasByPostIdRes__Output>): grpc.ClientUnaryCall;
  getMetadatasByPostId(argument: _metadata_GetMetadatasByPostIdReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_metadata_GetMetadatasByPostIdRes__Output>): grpc.ClientUnaryCall;
  getMetadatasByPostId(argument: _metadata_GetMetadatasByPostIdReq, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_GetMetadatasByPostIdRes__Output>): grpc.ClientUnaryCall;
  getMetadatasByPostId(argument: _metadata_GetMetadatasByPostIdReq, callback: grpc.requestCallback<_metadata_GetMetadatasByPostIdRes__Output>): grpc.ClientUnaryCall;
  
  GetMetadatasLast3Day(argument: _metadata_GetMetadatasLast3DayReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_GetMetadatasLast3DayRes__Output>): grpc.ClientUnaryCall;
  GetMetadatasLast3Day(argument: _metadata_GetMetadatasLast3DayReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_metadata_GetMetadatasLast3DayRes__Output>): grpc.ClientUnaryCall;
  GetMetadatasLast3Day(argument: _metadata_GetMetadatasLast3DayReq, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_GetMetadatasLast3DayRes__Output>): grpc.ClientUnaryCall;
  GetMetadatasLast3Day(argument: _metadata_GetMetadatasLast3DayReq, callback: grpc.requestCallback<_metadata_GetMetadatasLast3DayRes__Output>): grpc.ClientUnaryCall;
  getMetadatasLast3Day(argument: _metadata_GetMetadatasLast3DayReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_GetMetadatasLast3DayRes__Output>): grpc.ClientUnaryCall;
  getMetadatasLast3Day(argument: _metadata_GetMetadatasLast3DayReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_metadata_GetMetadatasLast3DayRes__Output>): grpc.ClientUnaryCall;
  getMetadatasLast3Day(argument: _metadata_GetMetadatasLast3DayReq, options: grpc.CallOptions, callback: grpc.requestCallback<_metadata_GetMetadatasLast3DayRes__Output>): grpc.ClientUnaryCall;
  getMetadatasLast3Day(argument: _metadata_GetMetadatasLast3DayReq, callback: grpc.requestCallback<_metadata_GetMetadatasLast3DayRes__Output>): grpc.ClientUnaryCall;
  
}

export interface MetadataServiceHandlers extends grpc.UntypedServiceImplementation {
  GetMetadatas: grpc.handleUnaryCall<_metadata_getMetadatasReq__Output, _metadata_getMetadatasRes>;
  
  GetMetadatasByPostId: grpc.handleUnaryCall<_metadata_GetMetadatasByPostIdReq__Output, _metadata_GetMetadatasByPostIdRes>;
  
  GetMetadatasLast3Day: grpc.handleUnaryCall<_metadata_GetMetadatasLast3DayReq__Output, _metadata_GetMetadatasLast3DayRes>;
  
}

export interface MetadataServiceDefinition extends grpc.ServiceDefinition {
  GetMetadatas: MethodDefinition<_metadata_getMetadatasReq, _metadata_getMetadatasRes, _metadata_getMetadatasReq__Output, _metadata_getMetadatasRes__Output>
  GetMetadatasByPostId: MethodDefinition<_metadata_GetMetadatasByPostIdReq, _metadata_GetMetadatasByPostIdRes, _metadata_GetMetadatasByPostIdReq__Output, _metadata_GetMetadatasByPostIdRes__Output>
  GetMetadatasLast3Day: MethodDefinition<_metadata_GetMetadatasLast3DayReq, _metadata_GetMetadatasLast3DayRes, _metadata_GetMetadatasLast3DayReq__Output, _metadata_GetMetadatasLast3DayRes__Output>
}
