import { Grid } from '@mui/material';
import { VscHeart, VscHeartFilled } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';
import { requestUrl } from '../../../common/etc';
import sample1 from '../../../asset/sample1.jpg';
import { getElapsedTimeString } from '../../../common/date.parser';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CocommentContent } from 'sns-interfaces/client.interface';
import { renderTitle } from '../Post/PostFooter';

//유저img, 좋아요수, 좋아요 했나, 대댓글수, 작성일자, 알람 보내야하니까 유저id까지.

const Cocomment = (props: { content: CocommentContent; key: number }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);

  const addLike = () => {
    axios.post('/gateway/ffl/addcocommentlike', {
      cocommentId: props.content.cocommentId,
    });
    setLiked(!liked);
    setLikesCount(likesCount + 1);
    return;
  };

  const removeLike = () => {
    axios.post('/gateway/ffl/removecocommentlike', {
      cocommentId: props.content.cocommentId,
    });
    setLiked(!liked);
    setLikesCount(likesCount - 1);
    return;
  };

  useEffect(() => {
    setLiked(props.content.liked);
    setLikesCount(props.content.likesCount);
  }, []);

  return (
    <>
      <Grid container spacing={0} style={{ marginBottom: '1rem' }}>
        <Grid item xs={10.5} style={{ overflowWrap: 'break-word' }}>
          <div style={{ marginLeft: '3.4rem' }}>
            <div style={{ width: '2.8rem', height: '100%', float: 'left' }}>
              <div
                style={{
                  width: '2.3rem',
                  height: '2.3rem',
                  borderRadius: '70%',
                  overflow: 'hidden',
                  marginTop: '0.4rem',
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

            {/* <div style={{ color: 'gray', fontSize: '0.8rem' }}>답글 달기</div> */}

            <div style={{ marginLeft: '2.8rem' }}>
              <span
                style={{
                  marginRight: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                }}
                onClick={() => {
                  navigate(`/feed/${props.content.username}`);
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
              <div style={{ fontSize: '0.8rem' }}>
                {renderTitle(props.content.cocomment)}
              </div>
            </div>
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
    </>
  );
};

export default Cocomment;
