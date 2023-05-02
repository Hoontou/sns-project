import { Button, Grid } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';

const UserinfoButton = (props: {
  addFollower(num: number): void;
  followed: boolean;
  users: { userTo: string; userFrom: string };
}) => {
  const [followed, setFollowed] = useState<boolean>(props.followed);

  const onClickFollow = async () => {
    if (followed === false) {
      //팔로우 추가
      await axios.post('/gateway/ffl/addfollow', {
        userTo: props.users.userTo,
        userFrom: props.users.userFrom,
      });
      //부모 컴포넌트의 follow숫자 수정함수
      props.addFollower(1);
      setFollowed(!followed);
      return;
    }
    //팔로우 삭제
    await axios.post('/gateway/ffl/removefollow', {
      userTo: props.users.userTo,
      userFrom: props.users.userFrom,
    });
    props.addFollower(-1);
    setFollowed(!followed);
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant={followed === true ? 'outlined' : 'contained'}
            color={followed === true ? 'error' : 'primary'}
            onClick={onClickFollow}
          >
            {followed === true ? '언팔로우' : '팔로우'}
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
