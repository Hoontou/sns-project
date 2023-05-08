import axios from 'axios';
import { useState, useEffect } from 'react';
import { VscComment, VscHeart, VscHeartFilled } from 'react-icons/vsc';
import Userlist from './Userlist';
import { MetadataDto } from '../Postlist';

//좋아요버튼, 게시글 좋아요 수, 댓글 수, 댓글 불러오기 후 댓글창 열기
const PostHeader = (props: { metadata: MetadataDto; userId: string }) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [likesCount, setLikesCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(true);
  const [img, setImg] = useState<string>('');
  const [commentCount, setCommentCount] = useState<number>(0);
  const [openUserList, setOpenUserList] = useState<boolean>(false);
  const [openComment, setOpenComment] = useState<boolean>(false);

  const addLike = () => {
    axios
      .post('/gateway/ffl/addLike', {
        userId: props.userId,
        postId: props.metadata.id,
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
        postId: props.metadata.id,
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
        postId: props.metadata.id,
        targetId: props.metadata.userId,
      })
      .then((res) => {
        const data: {
          liked: boolean;
          likesCount: number;
          commentCount: number;
          username: string;
          img: string;
        } = res.data;
        setLikesCount(data.likesCount);
        setLiked(data.liked);
        setCommentCount(data.commentCount);
        setUsername(data.username);
        setImg(data.img);
        setLoaded(true);
      });
  }, [props.metadata.id, props.userId]);
  return (
    <div>
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
                setOpenUserList(!openUserList);
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
        {props.metadata.title}
      </div>
      {openUserList && (
        <Userlist
          open={openUserList}
          setOpenUserList={setOpenUserList}
          targetId={props.metadata.id}
          type={'like'}
        />
      )}
    </div>
  );
};
export default PostHeader;
