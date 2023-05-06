import axios from 'axios';
import { useState, useEffect } from 'react';
import { VscComment, VscHeart, VscHeartFilled } from 'react-icons/vsc';
import Likeslist from './Likeslist';

//좋아요버튼, 게시글 좋아요 수, 댓글 수, 댓글 불러오기 후 댓글창 열기
const PostHeader = (props: {
  title: string;
  userId: string;
  postId: string;
}) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [likesCount, setLikesCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(true);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [openLikeslist, setOpenLikeslist] = useState<boolean>(false);
  const [openComment, setOpenComment] = useState<boolean>(false);

  const addLike = () => {
    axios
      .post('/gateway/ffl/addLike', {
        userId: props.userId,
        postId: props.postId,
      })
      .then(() => {
        setLikesCount(likesCount + 1);
        setLiked(!liked);
      });
  };
  const removeLike = () => {
    axios
      .post('/gateway/ffl/removelike', {
        userId: props.userId,
        postId: props.postId,
      })
      .then(() => {
        setLikesCount(likesCount - 1);
        setLiked(!liked);
      });
  };

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
          username: string;
        } = res.data;
        setLikesCount(data.likesCount);
        setLiked(data.liked);
        setCommentCount(data.commentCount);
        setUsername(data.username);
        setLoaded(true);
      });
  }, [props.postId, props.userId]);
  return (
    <>
      {loaded && (
        <div
          style={{ width: '95%', margin: '0.2rem auto', position: 'relative' }}
        >
          {liked === false ? (
            <VscHeart
              fontSize='30px'
              style={{ marginRight: '0.5rem' }}
              onClick={addLike}
            />
          ) : (
            <VscHeartFilled
              fontSize='30px'
              style={{ marginRight: '0.5rem', color: 'red' }}
              onClick={removeLike}
            />
          )}

          <VscComment fontSize='30px' style={{ marginRight: '0.5rem' }} />
          {likesCount === 0 ? (
            <span style={{ position: 'absolute', bottom: '0', right: '0' }}>
              첫번째로 좋아요를 눌러보세요
            </span>
          ) : (
            <span
              style={{ position: 'absolute', bottom: '0', right: '0' }}
              onClick={() => {
                setOpenLikeslist(!openLikeslist);
              }}
            >
              좋아요 {likesCount}개
            </span>
          )}
        </div>
      )}
      <div style={{ width: '95%', margin: '0.2rem auto', marginTop: '0.5rem' }}>
        {loaded && (
          <a
            style={{
              marginRight: '0.5rem',
              fontWeight: '600',
              fontSize: '1.1rem',
            }}
            href={`/userfeed/${props.userId}`}
          >
            {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
            {username}
          </a>
        )}
        {props.title}
      </div>
      {openLikeslist && (
        <Likeslist
          open={openLikeslist}
          setOpenLikeslist={setOpenLikeslist}
          postId={props.postId}
        />
      )}
    </>
  );
};
export default PostHeader;
