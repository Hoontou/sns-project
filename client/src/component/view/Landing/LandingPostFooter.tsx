import axios from 'axios';
import { useState, Dispatch, SetStateAction } from 'react';
import { VscComment, VscHeart, VscHeartFilled } from 'react-icons/vsc';

import { PostFooterContent } from 'sns-interfaces/client.interface';
import { useNavigate } from 'react-router-dom';
import { getElapsedTimeString } from '../../../common/date.parser';
import Userlist from '../../common/Userlist';

//좋아요버튼, 게시글 좋아요 수, 댓글 수, 댓글 불러오기 후 댓글창 열기
const LandingPostFooter = (props: {
  index: number;
  postId: string;
  createdAt: string;
  userId: string;
  postFooterContent: PostFooterContent;
  openCo(index: number): void;
}) => {
  const navigate = useNavigate();
  const [openUserList, setOpenUserList] = useState<boolean>(false);
  //얕은복사로 붙여넣기
  const [postContent, setContent] = useState<PostFooterContent>({
    ...props.postFooterContent,
  });

  const addLike = () => {
    setContent({
      ...postContent,
      likesCount: postContent.likesCount + 1,
      liked: !postContent.liked,
    });
    axios
      .post('/gateway/ffl/addLike', {
        userId: props.userId,
        postId: props.postId,
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
        postId: props.postId,
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
            props.openCo(props.index);
          }}
        />
        {postContent.likesCount === 0 ? (
          // <span style={{ position: 'absolute', bottom: '0', right: '0' }}>
          //위 코드는 아이콘의 오른쪽 끝에 붙이는 코드
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            첫번째로 좋아요를 눌러보세요
          </div>
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
            }}
            onClick={() => {
              navigate(`/userfeed/${postContent.userId}`);
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
            }}
            onClick={() => {
              props.openCo(props.index);
            }}
          >
            댓글 {props.postFooterContent.commentCount}개 보기
          </span>
        )}

        <span
          style={{
            display: 'block',
            color: 'gray',
            fontSize: '0.8rem',
            marginTop: '-0.2rem',
          }}
        >
          {getElapsedTimeString(props.createdAt)}
        </span>
      </div>
      {openUserList && (
        <Userlist
          open={openUserList}
          setOpenUserList={setOpenUserList}
          targetId={props.postId}
          type={'like'}
        />
      )}
    </div>
  );
};
export default LandingPostFooter;
