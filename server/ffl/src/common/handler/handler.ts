import { AmqpMessage } from 'sns-interfaces';
import { followRepository } from '../../database/follow.repo';
import { likeRopository } from '../../database/like.repo';

export const msgHandler = (message: AmqpMessage) => {
  const data: unknown = JSON.parse(message.content.toString());

  if (message.properties.type === 'addFollow') {
    followRepository.addFollow(data as { userTo: string; userFrom: string });
    return;
  }
  if (message.properties.type === 'removeFollow') {
    followRepository.removeFollow(data as { userTo: string; userFrom: string });
    return;
  }
  if (message.properties.type === 'addLike') {
    likeRopository.addLike(data as { postId: string; userId: string });
    return;
  }
  if (message.properties.type === 'removeLike') {
    likeRopository.removeLike(data as { postId: string; userId: string });
    return;
  }
};
