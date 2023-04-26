// Original file: src/proto/metadata.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { getpostsReq as _metadataPackage_getpostsReq, getpostsReq__Output as _metadataPackage_getpostsReq__Output } from '../metadataPackage/getpostsReq';
import type { getpostsRes as _metadataPackage_getpostsRes, getpostsRes__Output as _metadataPackage_getpostsRes__Output } from '../metadataPackage/getpostsRes';

export interface MetadataServiceClient extends grpc.Client {
  GetPosts(argument: _metadataPackage_getpostsReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_metadataPackage_getpostsRes__Output>): grpc.ClientUnaryCall;
  GetPosts(argument: _metadataPackage_getpostsReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_metadataPackage_getpostsRes__Output>): grpc.ClientUnaryCall;
  GetPosts(argument: _metadataPackage_getpostsReq, options: grpc.CallOptions, callback: grpc.requestCallback<_metadataPackage_getpostsRes__Output>): grpc.ClientUnaryCall;
  GetPosts(argument: _metadataPackage_getpostsReq, callback: grpc.requestCallback<_metadataPackage_getpostsRes__Output>): grpc.ClientUnaryCall;
  getPosts(argument: _metadataPackage_getpostsReq, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_metadataPackage_getpostsRes__Output>): grpc.ClientUnaryCall;
  getPosts(argument: _metadataPackage_getpostsReq, metadata: grpc.Metadata, callback: grpc.requestCallback<_metadataPackage_getpostsRes__Output>): grpc.ClientUnaryCall;
  getPosts(argument: _metadataPackage_getpostsReq, options: grpc.CallOptions, callback: grpc.requestCallback<_metadataPackage_getpostsRes__Output>): grpc.ClientUnaryCall;
  getPosts(argument: _metadataPackage_getpostsReq, callback: grpc.requestCallback<_metadataPackage_getpostsRes__Output>): grpc.ClientUnaryCall;
  
}

export interface MetadataServiceHandlers extends grpc.UntypedServiceImplementation {
  GetPosts: grpc.handleUnaryCall<_metadataPackage_getpostsReq__Output, _metadataPackage_getpostsRes>;
  
}

export interface MetadataServiceDefinition extends grpc.ServiceDefinition {
  GetPosts: MethodDefinition<_metadataPackage_getpostsReq, _metadataPackage_getpostsRes, _metadataPackage_getpostsReq__Output, _metadataPackage_getpostsRes__Output>
}
