import { Avatar, Grid } from '@mui/material';
import { requestUrl } from '../../../common/etc';
import { MetadataDto } from '../Post/Postlist';
import { PostFooterContent } from '../Post/post.interfaces';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import CommentItem from './CommentItem';
import axios from 'axios';
import CommentInput from './CommentInput';
import { CommentItemContent } from 'sns-interfaces';
import { VscArrowLeft } from 'react-icons/vsc';

const defaultCommentItemContent: CommentItemContent = {
  liked: false,
  commentId: 0,
  comment: '',
  createdAt: '',
  userId: '',
  likesCount: 0,
  cocommentCount: 0,
  username: '',
  img: '',
};

const Comment = (props: {
  metadata: MetadataDto;
  postFooterContent: PostFooterContent;
  userId: string;
  setOpenComment: Dispatch<SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [pending, setPending] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [commentItems, setCommentItems] = useState<CommentItemContent[]>([]);

  const submitNewComment = (value: string) => {
    //게시글 id, 작성자 id, 내용,
    axios.post('/gateway/post/addcomment', {
      comment: value,
      postId: props.postFooterContent.id,
    });
    axios.get('/gateway/user/getusernamewithimg').then((res) => {
      const data: { img: string; username: string; userId: string } = res.data;
      const newComment = {
        ...defaultCommentItemContent,
        img: data.img,
        username: data.username,
        comment: value,
        userId: data.userId,
      };
      //맨앞에 푸시
      setCommentItems([newComment, ...commentItems]);
    });
  };

  const getComments = async () => {
    setPending(true);
    axios
      .post('/gateway/post/getcommentlist', {
        postId: props.postFooterContent.id,
        page,
      })
      .then((res) => {
        const {
          commentItem: newComments,
        }: { commentItem: CommentItemContent[] } = res.data;
        setPage(page + 1);
        setCommentItems([...commentItems, ...newComments]);
        setPending(false);
      });
  };

  useEffect(() => {
    getComments().then(() => {
      setSpin(false);
    });
  });

  const renderComment = commentItems?.map((content, index) => {
    return (
      <CommentItem
        content={content}
        key={index}
        // setCommentItems={setCommentItems}
      />
    );
  });

  return (
    <>
      {spin && 'waiting...'}
      {!spin && (
        <div style={{ height: '80vh', overflowY: 'auto' }}>
          <div
            style={{
              fontSize: '1.5rem',
              paddingTop: '0.5rem',
              position: 'fixed',
              zIndex: '999',
              backgroundColor: 'white',
              width: '100%',
            }}
            className='text-center'
          >
            <VscArrowLeft
              style={{
                marginBottom: '0.3rem',
                fontSize: '2rem',
                position: 'fixed',
                left: '1rem',
              }}
              onClick={() => {
                props.setOpenComment(false);
              }}
            />
            <span>댓글</span>
          </div>
          <div style={{ paddingTop: '2.2rem' }}>
            <Grid container spacing={1} style={{ marginTop: '0.2rem' }}>
              <Grid item xs={2.5}>
                <Avatar
                  sx={{ width: 45, height: 45 }}
                  style={{ margin: '0 auto' }}
                  alt={'profile img'}
                  src={`${requestUrl}/${props.postFooterContent.img}`}
                ></Avatar>
              </Grid>
              <Grid item xs={9} style={{ overflowWrap: 'break-word' }}>
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
                  {props.postFooterContent.username}
                </span>
                <span
                  style={{
                    color: 'gray',
                    marginLeft: '0.2rem',
                    fontSize: '0.8rem',
                  }}
                >
                  {'3일전'}
                </span>
                <div>{props.postFooterContent.title}</div>
              </Grid>
              <Grid item xs={9.5}></Grid>
            </Grid>
            <hr style={{ marginTop: '-0.2rem' }}></hr>
            <div style={{ marginBottom: '4rem' }}>
              <div>{renderComment}</div>
              {props.postFooterContent.commentCount > commentItems?.length && (
                <div className='text-center' onClick={getComments}>
                  {pending ? '가져오는 중...' : '더 불러오기'}
                </div>
              )}
            </div>
            <div>
              <CommentInput
                submitNewComment={submitNewComment}
                setCommentItems={setCommentItems}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Comment;
