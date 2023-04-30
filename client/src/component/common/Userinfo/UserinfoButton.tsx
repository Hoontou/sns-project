import { Button, Grid } from '@mui/material';
import axios from 'axios';

const UserinfoButton = (props: {
  addFollower(num: number): void;
  followed: boolean;
  users: { userTo: string; userFrom: string };
}) => {
  const onClickFollow = async () => {
    if (props.followed === false) {
      //팔로우 추가
      await axios.post('/gateway/ffl/addfollow', {
        userTo: props.users.userTo,
        userFrom: props.users.userFrom,
      });
      props.addFollower(1);
      props.followed = true;
    }
    //팔로우 삭제
    await axios.post('/gateway/ffl/removefollow', {
      userTo: props.users.userTo,
      userFrom: props.users.userFrom,
    });
    props.addFollower(-1);
    props.followed = false;
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant={props.followed === true ? 'outlined' : 'contained'}
            color={props.followed === true ? 'error' : 'primary'}
            onClick={onClickFollow}
          >
            {props.followed === true ? '언팔로우' : '팔로우'}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button fullWidth variant='outlined'>
            메세지
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default UserinfoButton;
