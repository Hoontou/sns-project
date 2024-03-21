import { Avatar, List, ListItem, ListItemAvatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChatRoomWithUserPop } from './interfaces';
import { requestUrl } from '../../../common/etc';
import sample from '../../../asset/sample1.jpg';
import { getElapsedTimeString } from '../../../common/date.parser';
import { primaryColor } from '../../../App';
import { useEffect, useState } from 'react';
import './components.css';

const controllTalkOverflow = (text: string) => {
  const overflow = 24;
  if (text.length <= overflow) {
    return text;
  } else {
    return text.slice(0, overflow) + '...';
  }
};

export const InboxCard = (props: {
  chatRoom: ChatRoomWithUserPop;
  index: number;
}) => {
  const [blink, setBlink] = useState<Boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const diff = Date.now() - Date.parse(props.chatRoom.lastUpdatedAt);

    if (diff <= 1000) {
      setBlink(true);
      setTimeout(() => setBlink(false), 200); // 1초 후에 Blinking 효과 종료
    }
  }, [props.chatRoom]);

  return (
    <ListItem
      className={blink ? 'inbox-item-blink' : ''}
      key={props.index}
      onClick={() => {
        navigate(`/direct/t/${props.chatRoom.chatRoomId}`);
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{ width: 50, height: 50 }}
          style={{ marginLeft: '-0.4rem' }}
          alt={String(props.index)}
          src={
            props.chatRoom.chatWithUserInfo.img === ''
              ? sample
              : `${requestUrl}/${props.chatRoom.chatWithUserInfo.img}`
          }
        ></Avatar>
      </ListItemAvatar>
      <div>
        <span
          className={
            props.chatRoom.newChatCount === 0 ? 'nonBlink' : 'blinkNewChat'
          }
          style={{
            color: primaryColor,
            position: 'fixed',
            right: '1rem',
          }}
        >
          {props.chatRoom.newChatCount === 0 ? '' : props.chatRoom.newChatCount}
        </span>
        <div
          style={{
            fontSize: '1.1rem',
            marginTop: '-0.2rem',
          }}
        >
          {props.chatRoom.chatWithUserInfo.username}
        </div>
        <div
          style={{
            marginTop: '-0.4rem',
            fontSize: '0.9rem',
          }}
        >
          {controllTalkOverflow(props.chatRoom.lastTalk)}
          &nbsp;&nbsp;·&nbsp;&nbsp;
          {getElapsedTimeString(props.chatRoom.lastUpdatedAt)}
        </div>
      </div>
    </ListItem>
  );
};
