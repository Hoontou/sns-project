import { Avatar, Grid } from '@mui/material';
import { VscHeart, VscHeartFilled } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';
import { requestUrl } from '../../../common/etc';
import { CommentItemContent } from 'sns-interfaces';
import sample1 from '../../../asset/sample1.jpg';
import { getElapsedTimeString } from '../../../common/date.parser';
import { useState } from 'react';

//유저img, 좋아요수, 좋아요 했나, 대댓글수, 작성일자, 알람 보내야하니까 유저id까지.

const Cocomment = (props: {
  content: {
    img: string;
    userId: string;
    username: string;
    createdAt: string;
    cocomment: string;
    liked: boolean;
    likesCount: number;
  };
  key: number;
}) => {
  const navigate = useNavigate();
  return (
    <>
      <Grid container spacing={1} style={{ marginBottom: '1rem' }}>
        <Grid item xs={1}>
          {/* 간격조정을 위한 빈칸 */}
        </Grid>
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
        <Grid item xs={7} style={{ overflowWrap: 'break-word' }}>
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
          <div>{props.content.cocomment}</div>
          <div style={{ color: 'gray', fontSize: '0.8rem' }}>답글 달기</div>
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
    </>
  );
};

export default Cocomment;
