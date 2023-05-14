import { Grid } from '@mui/material';
import { useState } from 'react';
import Userlist from '../Userlist';

const UserinfoNums = (props: {
  postcount: number;
  follower: number;
  following: number;
  userId: string;
}) => {
  const [type, setType] = useState<'follower' | 'following' | ''>('');
  const [openUserList, setOpenUserList] = useState<boolean>(false);

  const onClickFollower = () => {
    if (props.follower === 0) {
      return;
    }
    setType('follower');
    setOpenUserList(!openUserList);
    return;
  };

  const onClickFollowing = () => {
    if (props.following === 0) {
      return;
    }
    setType('following');
    setOpenUserList(!openUserList);
    return;
  };

  return (
    <>
      <Grid item xs={2.6} className='row align-items-center text-center'>
        <span>
          <div>{props.postcount}</div>
          <div>게시물</div>
        </span>
      </Grid>
      <Grid item xs={2.6} className='row align-items-center text-center'>
        <span onClick={onClickFollower}>
          <div>{props.follower}</div>
          <div>팔로워</div>
        </span>
      </Grid>
      <Grid item xs={2.6} className='row align-items-center text-center'>
        <span onClick={onClickFollowing}>
          <div>{props.following}</div>
          <div>팔로잉</div>
        </span>
      </Grid>
      {type !== '' && openUserList && (
        <Userlist
          open={openUserList}
          setOpenUserList={setOpenUserList}
          targetId={props.userId}
          type={type}
        />
      )}
    </>
  );
};

export default UserinfoNums;
