import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { VscComment, VscHeart, VscHeartFilled } from 'react-icons/vsc';
import { PostFooterContent } from 'sns-interfaces/client.interface';
import { getElapsedTimeString } from '../../../common/date.parser';
import UserlistModal from '../UserlistModal';
import { axiosInstance } from '../../../App';

/**글에서 태그를 a태그로 감싸서 리턴해줌 */
export const renderTitle = (title: string) => {
  const tmp = title.split(/(#\S+|@\S+)/).filter((part) => part.trim() !== '');

  return tmp.map((item, index) => {
    if (item.at(0) === '@') {
      return (
        <span key={index * 377}>
          <a
            style={{ textDecoration: 'none' }}
            href={`/feed/${item.substring(1)}`}
          >
            {item}
          </a>
          &nbsp;
        </span>
      );
    }
    if (item.at(0) === '#') {
      return (
        <span key={index * 377}>
          <a
            style={{ textDecoration: 'none' }}
            href={`/search/hashtag/${item.substring(1)}`}
          >
            {item}
          </a>
          &nbsp;
        </span>
      );
    }
    return item;
  });
};

//좋아요버튼, 게시글 좋아요 수, 댓글 수, 댓글 불러오기 후 댓글창 열기
const PostFooter = (props: {
  fulfilled: boolean;
  postId: string;
  createdAt: string;
  userId: string;
  setOpenComment: Dispatch<SetStateAction<boolean>>;
  postFooterContent: PostFooterContent;
}) => {
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
    axiosInstance
      .post('/ffl/addLike', {
        postId: props.postId,
        postOwnerUserId: props.postFooterContent.userId,
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
    axiosInstance
      .post('/ffl/removelike', {
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

  useEffect(() => {
    setContent({ ...props.postFooterContent });
  }, [props.postFooterContent]);

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
        {props.fulfilled &&
          (postContent.likesCount === 0 ? (
            // <span style={{ position: 'absolute', bottom: '0', right: '0' }}>
            //위 코드는 아이콘의 오른쪽 끝에 붙이는 코드
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              첫번째로 좋아요를 눌러보세요
            </div>
          ) : (
            // <></>
            <span
              style={{ position: 'absolute', bottom: '0', right: '0' }}
              onClick={() => {
                setOpenUserList(!openUserList);
              }}
            >
              좋아요 {postContent.likesCount}개
            </span>
          ))}
      </div>
      {props.fulfilled && (
        <div
          style={{
            width: '95%',
            margin: '0.2rem auto',
            marginTop: '0.5rem',
            marginBottom: '-0.5rem',
            overflowWrap: 'break-word', //자동줄바꿈
          }}
        >
          <div>
            <a
              style={{
                marginRight: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                color: 'black',
              }}
              href={`/feed/${postContent.username}`}
            >
              {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
              {postContent.username}
            </a>
            {renderTitle(postContent.title)}
          </div>
          {props.postFooterContent.commentCount > 0 && (
            <span
              style={{
                color: 'gray',
                fontSize: '0.8rem',
              }}
              onClick={() => {
                props.setOpenComment(true);
              }}
            >
              댓글 {props.postFooterContent.commentCount}개 보기
            </span>
          )}
        </div>
      )}
      <div style={{ width: '95%', margin: '0.2rem auto', marginTop: '0.5rem' }}>
        <span
          style={{
            marginTop: '-0.2rem',
            display: 'block',
            color: 'gray',
            fontSize: '0.8rem',
          }}
        >
          {getElapsedTimeString(props.createdAt)}
        </span>
      </div>
      {openUserList && (
        <UserlistModal
          open={openUserList}
          setOpenUserList={setOpenUserList}
          targetId={props.postId}
          type={'like'}
        />
      )}
    </div>
  );
};
export default PostFooter;
