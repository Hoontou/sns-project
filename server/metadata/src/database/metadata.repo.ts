import mongoose from 'mongoose';
import { MetadataDto } from 'sns-interfaces';

const metadataSchema = new mongoose.Schema({
  _id: String,
  //받은 objectid로 _id에 바로넣기
  userId: String,
  files: Array,
  createdAt: {
    type: Date,
    default: Date.now, // 현재 날짜 및 시간으로 기본값 설정
  },
});
metadataSchema.index({
  userId: 1,
});

const Metadata = mongoose.model('metadata', metadataSchema);

class MetaRepository {
  constructor(public readonly db) {}
  //constructor(public readonly db) {connectMongo();}
  //스키마 다중연결을 고려해서 몽고연결은 index.ts에서

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  async saveMeatadata(metadataDto: MetadataDto) {
    const newOne = await new this.db(metadataDto);
    newOne
      .save()
      .then(() => console.log('meatadata stored in mongo successfully'))
      .catch(() => console.log('err when storing metadata in mongo'));
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
    return newOne;
  }
}
export const metaRepository = new MetaRepository(Metadata);
