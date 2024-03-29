import { Divider, IconButton, InputBase, Paper } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { Socket } from 'socket.io-client';
import { IoMdPaperPlane } from 'react-icons/io';
import { DirectMessage } from '../interfaces';

const MessageInput = (props: {
  socket: Socket | undefined;
  addNewMessage: (message: DirectMessage) => void;
}) => {
  const [message, setMessage] = useState<string>('');

  const sendDirectMessage = (message: string) => {
    if (message === '') {
      return;
    }
    const tmpId = Math.floor(Math.random() * 1023) + 1;

    const messageForm: {
      messageType: string;
      content: string;
      tmpId: number;
    } = {
      messageType: 'text',
      content: message,
      tmpId,
    };
    const newMessage: DirectMessage = {
      ...messageForm,
      id: -1,
      chatRoomId: 0,
      isMyChat: true,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    props.socket?.emit('sendMessage', { messageForm });
    props.addNewMessage(newMessage);
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
        placeholder='메세지 입력...'
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
        style={{ marginRight: '0.5rem' }}
        color={message ? 'primary' : 'default'}
        aria-label='directions'
        onClick={(e) => {
          sendDirectMessage(message);
          setMessage('');
          //여기 추가로 내 챗룸에 방금보낸 메세지 display해아함
        }}
      >
        <IoMdPaperPlane style={{ fontSize: '1.9rem' }} />
      </IconButton>
    </Paper>
  );
};

export default MessageInput;
