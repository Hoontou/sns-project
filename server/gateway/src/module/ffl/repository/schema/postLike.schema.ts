import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MetadataSchemaDefinition } from 'src/module/metadata/repository/schema/metadata.schema';
import { UserSchemaDefinition } from 'src/module/user/schema/user.schema';

export type PostLikeDocument = HydratedDocument<PostLikeSchemaDefinition>;

//여기에 인자로 {collection: 'likes'}하면 모듈에 가서 대문자 'Like'로 만들어도 되긴함
//근데 또 ref Populate는 안된다.
//뭐지? 경우의수 다 테스트해봤는데 안됨.
@Schema()
export class PostLikeSchemaDefinition {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Number })
  userId: number;

  //postId에는 버츄얼 말고 ref populate를 걸고싶은데
  //nestjs 몽구스에서는 컬렉션 이름으로 맨앞에 대문자를 넣었을때
  //카멜케이스로 변환 + 맨뒤에 s가 안붙여진다.
  //뭐지? 버전이 낮아서그런가?
  //대문자로 그냥 박아버리면 'Like' 그냥 그대로 컬렉션이름이 돼버림

  @Prop({ required: true, type: String })
  postId: string;
}

export const PostLikeSchema = SchemaFactory.createForClass(
  PostLikeSchemaDefinition,
);

PostLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const UserPop = 'userPop';
export const MetadataPop = 'metadataPop';
PostLikeSchema.virtual(UserPop, {
  ref: 'user',
  localField: 'userId',
  foreignField: 'userId',
  justOne: true,
});

PostLikeSchema.virtual(MetadataPop, {
  ref: 'metadata',
  localField: 'postId',
  foreignField: '_id',
  justOne: true,
});

export interface PostLikeSchemaDefinitionExecPop
  extends PostLikeSchemaDefinition {
  userPop?: UserSchemaDefinition;
  metadataPop?: MetadataSchemaDefinition;
}
