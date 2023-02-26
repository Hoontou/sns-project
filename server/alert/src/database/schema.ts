import mongoose from 'mongoose';

const metadataSchema = new mongoose.Schema({
  userUuid: String,
  postUuid: String,
  comment: String,
  files: Array,
});

export interface MetadataDto {
  userUuid: string;
  postUuid: string;
  files: string[];
  commnet: string;
}

const Metadata = mongoose.model('metadata', metadataSchema);

//Dto파싱해서 document로 만들어 저장까지 해주는 함수.
export const newMeatadata = (metadataDto: MetadataDto) => {
  const newOne = new Metadata(metadataDto);
  newOne
    .save()
    .then(() => console.log('meatadata stored in mongo successfully'))
    .catch(() => console.log('err when storing metadata in mongo'));
  //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
  return newOne;
};
