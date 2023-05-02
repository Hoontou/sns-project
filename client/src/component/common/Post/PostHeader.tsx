import axios from 'axios';
import { useState, useEffect } from 'react';
import { VscComment, VscHeart } from 'react-icons/vsc';

//좋아요버튼, 게시글 좋아요 수, 댓글 수, 댓글 불러오기 후 댓글창 열기
const PostHeader = (props: {
  title: string;
  userId: string;
  postId: string;
}) => {
  const [likesCount, setLikesCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(true);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [openComment, setOpenComment] = useState<boolean>(false);

  useEffect(() => {
    axios
      .post('/gateway/postheader', {
        userId: props.userId,
        postId: props.postId,
      })
      .then((res) => {
        const data: {
          liked: boolean;
          likesCount: number;
          commentCount: number;
        } = res.data;
        setLikesCount(data.likesCount);
        setLiked(data.liked);
        setCommentCount(data.commentCount);
      });
  }, []);
  return (
    <>
      <div
        style={{ width: '95%', margin: '0.2rem auto', position: 'relative' }}
      >
        <VscHeart fontSize='30px' style={{ marginRight: '0.5rem' }} />
        <VscComment fontSize='30px' style={{ marginRight: '0.5rem' }} />
        <span style={{ position: 'absolute', bottom: '0', right: '0' }}>
          z9hoon님 외 좋아요 300개
        </span>
      </div>
      <div style={{ width: '95%', margin: '0.2rem auto', marginTop: '0.5rem' }}>
        <a
          style={{
            marginRight: '0.5rem',
            fontWeight: '600',
            fontSize: '1.1rem',
          }}
          href={`/userfeed/${props.userId}`}
        >
          {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
          hoontou
        </a>
        {props.title}
      </div>
    </>
  );
};
export default PostHeader;
