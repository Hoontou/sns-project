import { Grid } from '@mui/material';
import { VscHeart, VscHeartFilled } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';
import { requestUrl } from '../../../common/etc';
import sample1 from '../../../asset/sample1.jpg';
import { getElapsedTimeString } from '../../../common/date.parser';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Cocomment from './Cocomment';
import { CommentItems, SubmitForm } from './etc';
import axios from 'axios';

const CommentItem = (props: {
  content: CommentItems;
  key: number;
  index: number;
  setSubmitForm: Dispatch<SetStateAction<SubmitForm>>;
  getCocomments(commentId: number, page: number, index: number): Promise<void>;
}) => {
  const navigate = useNavigate();
  // const [content, setContent] = useState<CommentItemContent>({
  //   ...props.content,
  // });

  const [pending, setPending] = useState<boolean>(false);
  const [openCocomment, setOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);

  const getCocomments = async () => {
    setPending(true);
    await props.getCocomments(props.content.commentId, page, props.index);
    setPage(page + 1);
    setPending(false);
    setOpen(true);
  };

  const addLike = () => {
    axios.post('/gateway/ffl/addcommentlike', {
      commentId: props.content.commentId,
    });
    setLiked(!liked);
    setLikesCount(likesCount + 1);
    return;
  };

  const removeLike = () => {
    axios.post('/gateway/ffl/removecommentlike', {
      commentId: props.content.commentId,
    });
    setLiked(!liked);
    setLikesCount(likesCount - 1);
    return;
  };

  useEffect(() => {
    setLiked(props.content.liked);
    setLikesCount(props.content.likesCount);
  }, []);

  const renderCocomment = props.content.cocomments?.map((content, index) => {
    return <Cocomment content={content} key={index} />;
  });

  return (
    <>
      <Grid container spacing={0} style={{ marginBottom: '1rem' }}>
        <Grid item xs={10.5} style={{ overflowWrap: 'break-word' }}>
          <div
            style={{
              float: 'left',
            }}
          >
            <div
              style={{
                width: '2.7rem',
                height: '2.7rem',
                borderRadius: '70%',
                overflow: 'hidden',
                marginTop: '0.4rem',
                marginLeft: '0.5rem',
                marginRight: '0.5rem',
              }}
            >
              <img
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                src={
                  props.content.img === ''
                    ? sample1
                    : `${requestUrl}/${props.content.img}`
                }
                alt='profile'
              />
            </div>
          </div>

          <div style={{ marginLeft: '3.7rem' }}>
            <span
              style={{
                fontSize: '0.9rem',
                marginRight: '0.5rem',
                fontWeight: '600',
              }}
              onClick={() => {
                navigate(`/userfeed/${props.content.userId}`);
              }}
            >
              {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
              {props.content.username}
            </span>
            <span
              style={{
                color: 'gray',
                marginLeft: '0.2rem',
                fontSize: '0.7rem',
              }}
            >
              {/* {props.content.createdAt} */}
              {getElapsedTimeString(props.content.createdAt)}
            </span>
            <div style={{ fontSize: '0.9rem' }}>{props.content.comment}</div>

            {props.content.cocommentCount > 0 && !openCocomment && (
              <span
                style={{
                  color: 'gray',
                  fontSize: '0.7rem',
                }}
                onClick={getCocomments}
              >
                ---답글 {props.content.cocommentCount}개 보기
              </span>
            )}

            {/* 방금 요청보낸 댓글에 대댓달기 방지위해 */}
            {props.content.createdAt !== '' && (
              <div
                style={{
                  color: 'gray',
                  fontSize: '0.7rem',
                }}
              >
                <span
                  onClick={() => {
                    props.setSubmitForm({
                      type: 'cocomment',
                      commentId: props.content.commentId,
                      targetUsername: props.content.username,
                      index: props.index,
                    });
                  }}
                >
                  답글 달기
                </span>
              </div>
            )}
          </div>
        </Grid>
        <Grid item xs={1.5} className='text-center'>
          {props.content.createdAt !== '' && (
            <span>
              {!liked ? (
                <VscHeart
                  fontSize='20px'
                  onClick={() => {
                    addLike();
                  }}
                />
              ) : (
                <VscHeartFilled
                  fontSize='20px'
                  style={{ color: 'red' }}
                  onClick={() => {
                    removeLike();
                  }}
                />
              )}
              <div style={{ fontSize: '0.7rem' }}>{likesCount}</div>
            </span>
          )}
        </Grid>
      </Grid>

      {props.content.cocomments.length > 0 && renderCocomment}
      {props.content.cocomments.length > 0 &&
        props.content.cocommentCount > props.content.cocomments.length && (
          <div
            className='text-center'
            style={{ color: 'gray', fontSize: '0.8rem' }}
            onClick={getCocomments}
          >
            {pending ? '가져오는 중...' : '더 불러오기'}
          </div>
        )}
    </>
  );
};

export default CommentItem;