import { Avatar, Grid } from '@mui/material';
import { requestUrl } from '../../../common/etc';
import { MetadataDto } from '../Post/Postlist';
import { PostFooterContent } from '../Post/post.interfaces';
import { useNavigate } from 'react-router-dom';
import { VscComment, VscHeart, VscHeartFilled } from 'react-icons/vsc';
import { useState } from 'react';

const Comment = (props: {
  metadata: MetadataDto;
  postFooterContent: PostFooterContent;
  userId: string;
}) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState<boolean>(false);

  return (
    <div>
      <Grid container spacing={1} style={{ marginTop: '0.2rem' }}>
        <Grid item xs={2.5}>
          <Avatar
            sx={{ width: 55, height: 55 }}
            style={{ margin: '0 auto' }}
            alt={'profile img'}
            src={`${requestUrl}/${props.postFooterContent.img}`}
          ></Avatar>
        </Grid>
        <Grid
          item
          xs={9.5}
          style={{ position: 'relative', overflowWrap: 'break-word' }}
        >
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
            {'1111111111'}
          </span>
          <div>111</div>
        </Grid>
      </Grid>
      <hr></hr>
      <Grid container spacing={1} style={{ marginTop: '0rem' }}>
        <Grid item xs={2.5}>
          <Avatar
            sx={{ width: 55, height: 55 }}
            style={{ margin: '0 auto' }}
            alt={'profile img'}
            src={`${requestUrl}/${props.postFooterContent.img}`}
          ></Avatar>
        </Grid>
        <Grid item xs={8}>
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
            {'1111111111'}
          </span>
          <div>1111111111111</div>
          <div style={{ color: 'gray', fontSize: '0.8rem' }}>
            ---답글 2개 보기
          </div>
          <div
            style={{ color: 'gray', fontSize: '0.8rem', marginTop: '0.4rem' }}
          >
            답글 달기
          </div>
        </Grid>
        <Grid item xs={1.5} className='text-center'>
          <span>
            {liked === false ? (
              <VscHeart fontSize='20px' onClick={() => {}} />
            ) : (
              <VscHeartFilled
                fontSize='20px'
                style={{ color: 'red' }}
                onClick={() => {}}
              />
            )}
            <div style={{ fontSize: '0.7rem' }}>1111</div>
          </span>
        </Grid>
      </Grid>
      <div style={{ position: 'absolute', bottom: '0', zIndex: '1' }}>
        가나다
      </div>
    </div>
  );
};
export default Comment;
