import { Grid } from '@mui/material';
import sample from '../../../asset/sample1.jpg';
import UserinfoButton from './UserinfoButton';
import UserinfoNums from './UserinfoNums';
import UserinfoMenu from './UserinfoMenu';
import { requestUrl } from '../../../common/etc';
import { UserInfo } from 'sns-interfaces/client.interface';
import { ReqUser } from 'sns-interfaces';
import { useEffect, useState } from 'react';

//타겟아이디가 없다? 내 피드에서 온 요청이라는 뜻.
const Userinfo = (props: {
  spin: boolean;
  userinfo: UserInfo;
  authinfo: ReqUser;
  feedType: 'otherInfo' | 'myInfo' | null;
}) => {
  const [follower, setFollower] = useState<number>(0);

  const authUserId =
    props.authinfo.success === true ? props.authinfo.userId : '';
  const addFollower = (num: number) => {
    setFollower(follower + num);
  };

  useEffect(() => {
    setFollower(props.userinfo.follower);
  }, [props.userinfo]);

  const renderIntro = props.userinfo.introduce
    .split('\n')
    .map((item, index) => {
      return <div key={index}>{item}</div>;
    });
  return (
    <div>
      {props.spin === true ? (
        'waiting...'
      ) : (
        <>
          <Grid container spacing={1}>
            <Grid item xs={9}>
              <h1>{props.userinfo.username}</h1>
            </Grid>
            {props.feedType === 'myInfo' && <UserinfoMenu />}
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={4} className='text-center'>
              <img
                src={
                  props.userinfo.img === ''
                    ? sample
                    : `${requestUrl}/${props.userinfo.img}`
                }
                alt='profile'
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '70%',
                  objectFit: 'cover',
                }}
              />
            </Grid>
            <UserinfoNums
              postcount={props.userinfo.postcount}
              follower={follower}
              following={props.userinfo.following}
              userId={
                props.feedType === 'myInfo' ? authUserId : props.userinfo.userId
              }
            />
          </Grid>
          <div style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
            <div>{props.userinfo.introduceName}</div>
            <div>{renderIntro}</div>
          </div>
        </>
      )}

      {/*내 피드로 들어왔을때는 아래 버튼 표시안함. 다른사람의 피드이고,  useEffect axios요청 끝난 후,  렌더링 시작. */}
      {props.feedType === 'otherInfo' && !props.spin && (
        <UserinfoButton
          addFollower={addFollower}
          followed={props.userinfo.followed}
          users={{
            userTo: props.userinfo.userId,
            userFrom: authUserId,
          }}
        />
      )}
    </div>
  );
};

export default Userinfo;
