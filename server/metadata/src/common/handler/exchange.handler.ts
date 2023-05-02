import { AmqpMessage, MetadataDto, UploadMessage } from 'sns-interfaces';
import { metaRepository } from '../../database/metadata.repo';
import { crypter } from '../crypter';

export const exchangeHandler = (msg: AmqpMessage) => {
  const content: unknown = JSON.parse(msg.content.toString());

  //exchange, 라우팅키 체크해서 해당 핸들러로 전달.
  if (msg.fields.exchange === 'upload') {
    if (msg.fields.routingKey == 'upload') {
      handleMetadata(content as UploadMessage);
    }
  }
};

const handleMetadata = (content: UploadMessage) => {
  //날라온 메세지 파싱
  const metadataDto: MetadataDto = {
    _id: content.postId,
    userId: crypter.decrypt(content.userId),
    files: content.files,
    title: content.title,
    createdAt: content.createdAt,
  };

  metaRepository.saveMeatadata(metadataDto);
};
