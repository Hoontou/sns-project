import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { FflServiceClient as _ffl_FflServiceClient, FflServiceDefinition as _ffl_FflServiceDefinition } from './ffl/FflService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  ffl: {
    FflService: SubtypeConstructor<typeof grpc.Client, _ffl_FflServiceClient> & { service: _ffl_FflServiceDefinition }
    GetFollowedReq: MessageTypeDefinition
    GetFollowedRes: MessageTypeDefinition
  }
}

