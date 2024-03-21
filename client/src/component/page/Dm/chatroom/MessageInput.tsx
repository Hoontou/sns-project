import { Divider, IconButton, InputBase, Paper } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { Socket } from 'socket.io-client';

const MessageInput = (props: { socket: Socket | undefined }) => {
  const [message, setMessage] = useState<string>('');

  const sendDirectMessage = (message: string) => {
    const messageForm: {
      messageType: string;
      content: string;
    } = { messageType: 'text', content: message };

    props.socket?.emit('sendMessage', { messageForm });
  };

  return (
    <Paper
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '3rem',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder='댓글 입력'
        inputProps={{ 'aria-label': 'search google maps' }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setMessage(e.target.value);
        }}
        value={message}
      />
      {/* {targetComment !== '' && (
    <>
      <Divider sx={{ height: 10, m: 0.5 }} orientation='vertical' />
      <span
        style={{ color: 'RoyalBlue' }}
        onClick={props.setSubmitFormToDefault}
      >
        {targetComment}에게 답글 작성중
      </span>
    </>
  )} */}
      <Divider sx={{ height: 10, m: 0.5 }} orientation='vertical' />
      <IconButton
        color='primary'
        aria-label='directions'
        onClick={(e) => {
          sendDirectMessage(message);
          setMessage('');
          //여기 추가로 내 챗룸에 방금보낸 메세지 display해아함
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>게시</span>
      </IconButton>
    </Paper>
  );
};

export default MessageInput;
