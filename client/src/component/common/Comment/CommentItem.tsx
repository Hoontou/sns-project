import { Avatar, Grid } from '@mui/material';
import { VscHeart, VscHeartFilled } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';
import { requestUrl } from '../../../common/etc';
import { CommentItemContent } from 'sns-interfaces';
import sample1 from '../../../asset/sample1.jpg';
import { getElapsedTimeString } from '../../../common/date.parser';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import axios from 'axios';
import Cocomment from './Cocomment';
import { SubmitForm } from './Comment';

//유저img, 좋아요수, 좋아요 했나, 대댓글수, 작성일자, 알람 보내야하니까 유저id까지.
export interface CocommentContent {
  img: string;
  userId: string;
  username: string;
  createdAt: string;
  cocomment: string;
  liked: boolean;
  likesCount: number;
}
const CommentItem = (props: {
  content: CommentItemContent;
  key: number;
  index: number;
  setSubmitForm: Dispatch<SetStateAction<SubmitForm>>;
  submittedCocomments: CocommentContent[]; //부모에서 대댓작성되면 여기로 값이 추가됨.
}) => {
  const navigate = useNavigate();
  // const [content, setContent] = useState<CommentItemContent>({
  //   ...props.content,
  // });

  const [pending, setPending] = useState<boolean>(false);
  const [openCocomment, setOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [cocomments, setCocomments] = useState<CocommentContent[]>([]);

  useEffect(() => {
    setCocomments([props.submittedCocomments[-1], ...cocomments]);
    console.log(props.submittedCocomments);
  }, [props.submittedCocomments]);

  const getCocomments = async () => {
    setPending(true);
    axios
      .post('/gateway/post/getcocommentlist', {
        commentId: props.content.commentId,
        page,
      })
      .then((res) => {
        const {
          cocommentItem: items,
        }: {
          cocommentItem: {
            cocomment: string;
            cocommentId: number;
            createdAt: string;
            img: string;
            liked: boolean;
            likesCount: number;
            userId: string;
            username: string;
          }[];
        } = res.data;

        setCocomments([...cocomments, ...items]);
        setPage(page + 1);
        setPending(false);
        setOpen(true);
      });
  };

  const renderCocomment = cocomments?.map((content, index) => {
    return <Cocomment content={content} key={index} />;
  });

  return (
    <>
      <Grid container spacing={1} style={{ marginBottom: '1rem' }}>
        <Grid item xs={2.5}>
          <Avatar
            sx={{ width: 45, height: 45 }}
            style={{ margin: '0 auto', marginTop: '0.1rem' }}
            alt={'profile img'}
            src={
              props.content.img === ''
                ? sample1
                : `${requestUrl}/${props.content.img}`
            }
          ></Avatar>
        </Grid>
        <Grid item xs={8} style={{ overflowWrap: 'break-word' }}>
          <span
            style={{
              marginRight: '0.5rem',
              fontWeight: '600',
              fontSize: '1.1rem',
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
              fontSize: '0.8rem',
            }}
          >
            {/* {props.content.createdAt} */}
            {getElapsedTimeString(props.content.createdAt)}
          </span>
          <div>{props.content.comment}</div>

          {props.content.cocommentCount > 0 && !openCocomment && (
            <span
              style={{ color: 'gray', fontSize: '0.8rem' }}
              onClick={getCocomments}
            >
              ---답글 {props.content.cocommentCount}개 보기
            </span>
          )}

          <div style={{ color: 'gray', fontSize: '0.8rem' }}>
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
        </Grid>
        <Grid item xs={1.5} className='text-center'>
          <span>
            {!props.content.liked ? (
              <VscHeart fontSize='20px' onClick={() => {}} />
            ) : (
              <VscHeartFilled
                fontSize='20px'
                style={{ color: 'red' }}
                onClick={() => {}}
              />
            )}
            <div style={{ fontSize: '0.7rem' }}>{props.content.likesCount}</div>
          </span>
        </Grid>
      </Grid>

      {openCocomment && renderCocomment}
      {openCocomment && props.content.cocommentCount > cocomments?.length && (
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
