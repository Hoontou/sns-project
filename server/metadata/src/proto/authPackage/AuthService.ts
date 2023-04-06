// Original file: src/proto/auth.proto

import type * as grpc from '@grpc/grpc-js';
import type { MethodDefinition } from '@grpc/proto-loader';
import type {
  LoginRequest as _authPackage_LoginRequest,
  LoginRequest__Output as _authPackage_LoginRequest__Output,
} from '../authPackage/LoginRequest';
import type {
  LoginResult as _authPackage_LoginResult,
  LoginResult__Output as _authPackage_LoginResult__Output,
} from '../authPackage/LoginResult';

export interface AuthServiceClient extends grpc.Client {
  login(
    argument: _authPackage_LoginRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_authPackage_LoginResult__Output>,
  ): grpc.ClientUnaryCall;
  login(
    argument: _authPackage_LoginRequest,
    metadata: grpc.Metadata,
    callback: grpc.requestCallback<_authPackage_LoginResult__Output>,
  ): grpc.ClientUnaryCall;
  login(
    argument: _authPackage_LoginRequest,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_authPackage_LoginResult__Output>,
  ): grpc.ClientUnaryCall;
  login(
    argument: _authPackage_LoginRequest,
    callback: grpc.requestCallback<_authPackage_LoginResult__Output>,
  ): grpc.ClientUnaryCall;
  login(
    argument: _authPackage_LoginRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_authPackage_LoginResult__Output>,
  ): grpc.ClientUnaryCall;
  login(
    argument: _authPackage_LoginRequest,
    metadata: grpc.Metadata,
    callback: grpc.requestCallback<_authPackage_LoginResult__Output>,
  ): grpc.ClientUnaryCall;
  login(
    argument: _authPackage_LoginRequest,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_authPackage_LoginResult__Output>,
  ): grpc.ClientUnaryCall;
  login(
    argument: _authPackage_LoginRequest,
    callback: grpc.requestCallback<_authPackage_LoginResult__Output>,
  ): grpc.ClientUnaryCall;
}

export interface AuthServiceHandlers extends grpc.UntypedServiceImplementation {
  login: grpc.handleUnaryCall<
    _authPackage_LoginRequest__Output,
    _authPackage_LoginResult
  >;
}

export interface AuthServiceDefinition extends grpc.ServiceDefinition {
  login: MethodDefinition<
    _authPackage_LoginRequest,
    _authPackage_LoginResult,
    _authPackage_LoginRequest__Output,
    _authPackage_LoginResult__Output
  >;
}
