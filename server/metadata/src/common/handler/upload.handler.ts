import { MetadataDto, UploadMessage } from 'sns-interfaces';
import { metaRepository } from '../../database/metadata.repo';

export const uploadHandler = (msg) => {
  //exchange가 upload인 메세지가 여기로 전달됨.
  //key 체크해서 해당 핸들러로 전달.

  const content = JSON.parse(msg.content.toString());
  if (msg.fields.routingKey == 'upload') {
    handleMetadata(content);
  }
};

const handleMetadata = (content: UploadMessage) => {
  //날라온 메세지 파싱
  const metadataDto: MetadataDto = {
    _id: content.postId,
    userId: content.userId,
    files: content.files,
    title: content.title,
    createdAt: content.createdAt,
  };

  metaRepository.saveMeatadata(metadataDto);
};
