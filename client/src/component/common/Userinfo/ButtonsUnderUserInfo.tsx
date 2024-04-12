import { Button, Grid } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../App';

const ButtonsUnderUserInfo = (props: {
  addFollower(num: number): void;
  followed: boolean;
  infoOwnerId: string;
}) => {
  const navigate = useNavigate();
  const [followed, setFollowed] = useState<boolean>(props.followed);

  const onClickFollow = async () => {
    if (followed === false) {
      //팔로우 추가
      await axiosInstance.post('/ffl/addfollow', {
        userTo: props.infoOwnerId,
      });
      //부모 컴포넌트의 follow숫자 수정함수
      props.addFollower(1);
      setFollowed(!followed);
      return;
    }
    //팔로우 삭제
    await axiosInstance.post('/ffl/removefollow', {
      userTo: props.infoOwnerId,
    });
    props.addFollower(-1);
    setFollowed(!followed);
  };

  const requestChatRoomId = async () => {
    const result: { data: { chatRoomId: number } } = await axiosInstance.post(
      '/dm/requestChatRoomId',
      {
        chatTargetUserId: props.infoOwnerId,
      }
    );

    navigate(`/direct/t/${result.data.chatRoomId}`);
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
          <Button
            fullWidth
            variant='outlined'
            onClick={() => {
              requestChatRoomId();
            }}
          >
            메세지
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default ButtonsUnderUserInfo;
