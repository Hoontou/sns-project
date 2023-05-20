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

const Comment = (props: {
  metadata: MetadataDto;
  postFooterContent: PostFooterContent;
  userId: string;
  setOpenComment: Dispatch<SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(0);
  const [commentItems, setCommentItems] = useState<CommentItemContent[] | null>(
    null
  );

  const submitNewComment = (value: string) => {
    //게시글 id, 작성자 id, 내용,
    // axios.post('/gateway/post/', {
    //   comment: e.currentTarget.value,
    //   userId: props.userId,
    //   postId: props.postFooterContent.id,
    // });
    console.log({
      comment: value,
      userId: props.userId,
      postId: props.postFooterContent.id,
    });
  };

  const getComments = () => {
    axios
      .post('/gateway/post/getcommentitem', {
        postId: props.postFooterContent.id,
        page,
      })
      .then((res) => {
        const { commentItem }: { commentItem: CommentItemContent[] } = res.data;
        console.log('댓글가져오기 성공, 페이지', page);
        setPage(page + 1);
        setCommentItems([...commentItem]);
      });
  };

  useEffect(() => {
    getComments();
  }, []);

  const renderComment = commentItems?.map((content, index) => {
    return <CommentItem content={content} key={index} />;
  });

  return (
    <div style={{ height: '80vh', overflowY: 'auto' }}>
      <div
        className='text-center'
        style={{
          fontSize: '1.5rem',
          marginTop: '0.5rem',
        }}
      >
        <VscArrowLeft
          style={{
            marginBottom: '0.3rem',
            left: '1rem',
            position: 'fixed',
            fontSize: '2rem',
          }}
          onClick={() => {
            props.setOpenComment(false);
          }}
        />
        댓글
      </div>
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
      <div style={{ marginBottom: '4rem' }}>{renderComment}</div>

      <CommentInput submitNewComment={submitNewComment} />
    </div>
  );
};
export default Comment;
