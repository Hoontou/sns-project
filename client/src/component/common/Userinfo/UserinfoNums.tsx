import { Grid } from '@mui/material';
import Userlist from '../Post/Userlist';
import { useState } from 'react';

const UserinfoNums = (props: {
  postcount: number;
  follower: number;
  following: number;
  userId: string;
}) => {
  const [type, setType] = useState<'follower' | 'following' | ''>('');
  const [openUserList, setOpenUserList] = useState<boolean>(false);
  return (
    <>
      <Grid item xs={2.6} className='row align-items-center text-center'>
        <span>
          <div>{props.postcount}</div>
          <div>게시물</div>
        </span>
      </Grid>
      <Grid item xs={2.6} className='row align-items-center text-center'>
        <span
          onClick={() => {
            setType('follower');
            setOpenUserList(!openUserList);
          }}
        >
          <div>{props.follower}</div>
          <div>팔로워</div>
        </span>
      </Grid>
      <Grid item xs={2.6} className='row align-items-center text-center'>
        <span
          onClick={() => {
            setType('following');
            setOpenUserList(!openUserList);
          }}
        >
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
