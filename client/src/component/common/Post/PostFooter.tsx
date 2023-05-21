import axios from 'axios';
import { useState, Dispatch, SetStateAction } from 'react';
import { VscComment, VscHeart, VscHeartFilled } from 'react-icons/vsc';
import Userlist from '../Userlist';
import { MetadataDto } from './Postlist';
import { PostFooterContent } from './post.interfaces';
import { useNavigate } from 'react-router-dom';
import { getElapsedTimeString } from '../../../common/date.parser';

//좋아요버튼, 게시글 좋아요 수, 댓글 수, 댓글 불러오기 후 댓글창 열기
const PostFooter = (props: {
  metadata: MetadataDto;
  userId: string;
  setOpenComment: Dispatch<SetStateAction<boolean>>;
  postFooterContent: PostFooterContent;
}) => {
  const navigate = useNavigate();
  const [openUserList, setOpenUserList] = useState<boolean>(false);
  //얕은복사로 붙여넣기
  const [postContent, setContent] = useState<PostFooterContent>({
    ...props.postFooterContent,
  });
  const addLike = () => {
    axios
      .post('/gateway/ffl/addLike', {
        userId: props.userId,
        postId: props.metadata.id,
      })
      .then(() => {
        setContent({
          ...postContent,
          likesCount: postContent.likesCount + 1,
          liked: !postContent.liked,
        });
      });
  };
  const removeLike = () => {
    axios
      .post('/gateway/ffl/removelike', {
        userId: props.userId,
        postId: props.metadata.id,
      })
      .then(() => {
        setContent({
          ...postContent,
          likesCount: postContent.likesCount - 1,
          liked: !postContent.liked,
        });
      });
  };

  return (
    <div>
      <div
        style={{ width: '95%', margin: '0.2rem auto', position: 'relative' }}
      >
        {postContent.liked === false ? (
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

        <VscComment
          fontSize='30px'
          style={{ marginRight: '0.5rem' }}
          onClick={() => {
            props.setOpenComment(true);
          }}
        />
        {postContent.likesCount === 0 ? (
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
            좋아요 {postContent.likesCount}개
          </span>
        )}
      </div>
      <div style={{ width: '95%', margin: '0.2rem auto', marginTop: '0.5rem' }}>
        <div>
          <span
            style={{
              marginRight: '0.5rem',
              fontWeight: '600',
              fontSize: '1.1rem',
            }}
            onClick={() => {
              navigate(`/userfeed/${props.userId}`);
            }}
          >
            {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
            {postContent.username}
          </span>
          {postContent.title}
        </div>
        {props.postFooterContent.commentCount > 0 && (
          <span
            style={{
              color: 'gray',
              fontSize: '0.8rem',
              display: 'block',
            }}
            onClick={() => {
              props.setOpenComment(true);
            }}
          >
            댓글 {props.postFooterContent.commentCount}개 보기
          </span>
        )}

        <span style={{ display: 'block', color: 'gray', fontSize: '0.8rem' }}>
          {getElapsedTimeString(props.postFooterContent.createdAt)}
        </span>
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
export default PostFooter;
