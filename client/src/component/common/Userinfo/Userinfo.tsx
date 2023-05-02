import { Grid } from '@mui/material';
import sample from '../../../asset/sample1.jpg';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserinfoButton from './UserinfoButton';

//타겟아이디가 없다? 내 피드에서 온 요청이라는 뜻.
const Userinfo = (props: { userId: string; targetId?: string }) => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [postcount, setPost] = useState<number>(0);
  const [follower, setFollower] = useState<number>(0);
  const [following, setFolloing] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [followed, setFollowed] = useState<boolean>(false);

  const addFollower = (num: number) => {
    setFollower(follower + num);
  };

  useEffect(() => {
    //userId는 usernums를 찾아서 올 아이디.
    //myId는 다른유저의 피드로 접근했을 시 다른유저를 팔로우했는지 찾을 용도.
    axios
      .post(
        '/gateway/userinfo',
        props.targetId === undefined
          ? { userId: props.userId }
          : { userId: props.targetId, myId: props.userId }
      )
      .then((res) => {
        const data:
          | {
              success: true;
              following: number;
              follower: number;
              postcount: number;
              username: string;
              followed: boolean;
            }
          | { success: false } = res.data;

        if (data.success === false) {
          //불러오기 실패했으면 다른곳으로 이동시킴.
          navigate('/myfeed');
          return;
        }

        setFolloing(data.following);
        setFollower(data.follower);
        setPost(data.postcount);
        setFollowed(data.followed);
        setUsername(data.username);
        setSpin(false);
      });
  }, [props.targetId, props.userId, navigate]);
  return (
    <div>
      {spin && 'waiting...'}
      <Grid container spacing={1}>
        <Grid item xs={9}>
          <h1>{username}</h1>
        </Grid>
        <Grid item xs={1.5} className='text-end'>
          <AddIcon />
        </Grid>
        <Grid item xs={1.5} className='text-end'>
          <MenuIcon />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={4} className='text-center'>
          <img
            src={sample}
            alt='profile'
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '70%',
              objectFit: 'cover',
            }}
          />
        </Grid>
        <Grid item xs={2.6} className='row align-items-center text-center'>
          <div>
            <div>{postcount}</div>
            <div>게시물</div>
          </div>
        </Grid>
        <Grid item xs={2.6} className='row align-items-center text-center'>
          <div>
            <div>{follower}</div>
            <div>팔로워</div>
          </div>
        </Grid>
        <Grid item xs={2.6} className='row align-items-center text-center'>
          <div>
            <div>{following}</div>
            <div>팔로잉</div>
          </div>
        </Grid>
      </Grid>
      <div style={{ marginTop: '0.2rem', marginBottom: '0.2rem' }}>
        this is my feed
      </div>

      {/*내 피드로 들어왔을때는 아래 버튼 표시안함, useEffect axios요청 끝난 후 렌더링 시작. */}
      {props.targetId && !spin && (
        <UserinfoButton
          addFollower={addFollower}
          followed={followed}
          users={{ userTo: props.targetId, userFrom: props.userId }}
        />
      )}

      <hr></hr>
    </div>
  );
};

export default Userinfo;
