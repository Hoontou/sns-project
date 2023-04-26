// Original file: src/proto/metadata.proto

import type { Timestamp as _google_protobuf_Timestamp, Timestamp__Output as _google_protobuf_Timestamp__Output } from '../google/protobuf/Timestamp';

export interface Post {
  'id'?: (string);
  'userId'?: (string);
  'files'?: (string)[];
  'title'?: (string);
  'createdAt'?: (_google_protobuf_Timestamp | null);
}

export interface Post__Output {
  'id'?: (string);
  'userId'?: (string);
  'files'?: (string)[];
  'title'?: (string);
  'createdAt'?: (_google_protobuf_Timestamp__Output);
}
