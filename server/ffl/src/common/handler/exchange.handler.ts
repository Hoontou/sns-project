import { AmqpMessage } from 'sns-interfaces';
import { likeRopository } from '../../database/like.repo';
import { commentLikeRopository } from '../../database/comment.like.repo';

export const exchangeHandler = (msg: AmqpMessage) => {
  const data: unknown = JSON.parse(msg.content.toString());

  //exchange, 라우팅키 체크해서 해당 핸들러로 전달.
  if (msg.fields.exchange === 'gateway') {
    if (msg.fields.routingKey === 'addLike') {
      likeRopository.addLike(data as { postId: string; userId: string });
      return;
    }
    if (msg.fields.routingKey === 'removeLike') {
      likeRopository.removeLike(data as { postId: string; userId: string });
      return;
    }
    if (msg.fields.routingKey === 'addCommentLike') {
      commentLikeRopository.addCommentLike(
        data as { commentId: number; userId: string },
      );
      return;
    }
    if (msg.fields.routingKey === 'removeCommentLike') {
      commentLikeRopository.removeCommentLike(
        data as { commentId: number; userId: string },
      );
      return;
    }
  }
};
