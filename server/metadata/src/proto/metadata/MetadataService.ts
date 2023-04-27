// Original file: src/proto/metadata.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
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
  
}

export interface MetadataServiceHandlers extends grpc.UntypedServiceImplementation {
  GetMetadatas: grpc.handleUnaryCall<_metadata_getMetadatasReq__Output, _metadata_getMetadatasRes>;
  
}

export interface MetadataServiceDefinition extends grpc.ServiceDefinition {
  GetMetadatas: MethodDefinition<_metadata_getMetadatasReq, _metadata_getMetadatasRes, _metadata_getMetadatasReq__Output, _metadata_getMetadatasRes__Output>
}
