import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { MetadataServiceClient as _metadata_MetadataServiceClient, MetadataServiceDefinition as _metadata_MetadataServiceDefinition } from './metadata/MetadataService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  google: {
    protobuf: {
      BoolValue: MessageTypeDefinition
      BytesValue: MessageTypeDefinition
      DoubleValue: MessageTypeDefinition
      FloatValue: MessageTypeDefinition
      Int32Value: MessageTypeDefinition
      Int64Value: MessageTypeDefinition
      StringValue: MessageTypeDefinition
      UInt32Value: MessageTypeDefinition
      UInt64Value: MessageTypeDefinition
    }
  }
  metadata: {
    GetMetadatasLast3DayReq: MessageTypeDefinition
    GetMetadatasLast3DayRes: MessageTypeDefinition
    Metadata: MessageTypeDefinition
    MetadataService: SubtypeConstructor<typeof grpc.Client, _metadata_MetadataServiceClient> & { service: _metadata_MetadataServiceDefinition }
    getMetadatasReq: MessageTypeDefinition
    getMetadatasRes: MessageTypeDefinition
  }
}

