import { Grid, Button } from '@mui/material';
import sample from '../../asset/sample1.jpg';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Userinfo = (props: { userId: string; username: string }) => {
  const [postcount, setPost] = useState<number>(0);
  const [follower, setFollower] = useState<number>(0);
  const [following, setFolloing] = useState<number>(0);
  const [isFollowed, setIsFol] = useState<boolean>(false);

  useEffect(() => {
    axios.post('/gateway/userinfo', { userId: props.userId }).then((res) => {
      const data: {
        following: number;
        follower: number;
        postcount: number;
      } = res.data;
      setFolloing(data.following);
      setFollower(data.follower);
      setPost(data.postcount);
    });
  }, [props.userId]);
  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={9}>
          <h1>{props.username}</h1>
        </Grid>
        <Grid item xs={1.5} className='text-end'>
          <AddIcon />
        </Grid>
        <Grid item xs={1.5} className='text-end'>
          <MenuIcon />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={4}>
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
      <div>this is my feed</div>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Button fullWidth variant='contained'>
            팔로우
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button fullWidth variant='outlined'>
            메세지
          </Button>
        </Grid>
      </Grid>
      <hr></hr>
    </div>
  );
};

export default Userinfo;
