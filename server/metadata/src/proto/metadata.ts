import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { MetadataServiceClient as _metadataPackage_MetadataServiceClient, MetadataServiceDefinition as _metadataPackage_MetadataServiceDefinition } from './metadataPackage/MetadataService';

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
      Timestamp: MessageTypeDefinition
      UInt32Value: MessageTypeDefinition
      UInt64Value: MessageTypeDefinition
    }
  }
  metadataPackage: {
    MetadataService: SubtypeConstructor<typeof grpc.Client, _metadataPackage_MetadataServiceClient> & { service: _metadataPackage_MetadataServiceDefinition }
    Post: MessageTypeDefinition
    getpostsReq: MessageTypeDefinition
    getpostsRes: MessageTypeDefinition
  }
}

