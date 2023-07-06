import { AmqpMessage } from 'sns-interfaces';
import { likeRopository } from '../../database/repository/like.repo';
import { commentLikeRopository } from '../../database/repository/comment.like.repo';
import { cocommentLikeRopository } from '../../database/repository/cocomment.like.repo';

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
    if (msg.fields.routingKey === 'addCocommentLike') {
      cocommentLikeRopository.addCocommentLike(
        data as { cocommentId: number; userId: string },
      );
      return;
    }
    if (msg.fields.routingKey === 'removeCocommentLike') {
      cocommentLikeRopository.removeCocommentLike(
        data as { cocommentId: number; userId: string },
      );
      return;
    }
  }
};
