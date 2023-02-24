import mongoose from 'mongoose';
import { crypter } from 'src/common/crypter';

const metadataSchema = new mongoose.Schema({
  userUuid: String,
  postUuid: String,
  files: Array,
});

interface MetadataDto {
  userUuid: string;
  postUuid: string;
  files: string[];
}

const Metadata = mongoose.model('metadata', metadataSchema);

//Dto파싱해서 document로 만들어 저장까지 해주는 함수.
export const newMeatadata = (metadataDto: MetadataDto) => {
  metadataDto.userUuid = crypter.decrypt(metadataDto.userUuid);
  //암호화된 userUuid가 들어오니 복호화 해주고
  const newOne = new Metadata(metadataDto);
  newOne.save();
  //Document만들어서 저장까지 해준다.
  return newOne;
};
