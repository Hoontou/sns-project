import type * as grpc from '@grpc/grpc-js';
import type {
  EnumTypeDefinition,
  MessageTypeDefinition,
} from '@grpc/proto-loader';

import type {
  AuthServiceClient as _authPackage_AuthServiceClient,
  AuthServiceDefinition as _authPackage_AuthServiceDefinition,
} from './authPackage/AuthService';

type SubtypeConstructor<
  Constructor extends new (...args: any) => any,
  Subtype,
> = {
  new (...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  authPackage: {
    AuthService: SubtypeConstructor<
      typeof grpc.Client,
      _authPackage_AuthServiceClient
    > & { service: _authPackage_AuthServiceDefinition };
    LoginCode: EnumTypeDefinition;
    LoginRequest: MessageTypeDefinition;
    LoginResult: MessageTypeDefinition;
  };
}
