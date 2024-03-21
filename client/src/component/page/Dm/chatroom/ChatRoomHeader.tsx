import { Avatar, ListItem, ListItemAvatar } from '@mui/material';
import { DirectUserInfo } from '../interfaces';
import { VscArrowLeft } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';
import { requestUrl } from '../../../../common/etc';
import sample from '../../../../asset/sample1.jpg';

const ChatRoomHeader = (props: { friendsInfo: DirectUserInfo }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        paddingTop: '0.2rem',
        position: 'fixed',
        zIndex: '999',
        backgroundColor: 'white',
        width: '100%',
      }}
    >
      <ListItem style={{ height: '3.7rem', position: 'relative' }}>
        <VscArrowLeft
          style={{ marginRight: '0.5rem' }}
          onClick={() => {
            navigate(-1);
          }}
        />
        <ListItemAvatar
          onClick={() => {
            navigate(`/feed/${props.friendsInfo.username}`);
          }}
        >
          <Avatar
            alt='profile'
            src={
              props.friendsInfo.img === ''
                ? sample
                : `${requestUrl}/${props.friendsInfo.img}`
            }
            sx={{
              marginTop: '0.5rem',
              width: '2.7rem',
              height: '2.7rem',
              marginLeft: '0.7rem',
              marginRight: '0.9rem',
              display: 'inline-block',
            }}
            onClick={() => {
              navigate(`/feed/${props.friendsInfo.username}`);
            }}
          />
        </ListItemAvatar>
        <div
          onClick={() => {
            navigate(`/feed/${props.friendsInfo.username}`);
          }}
        >
          <div style={{ fontSize: '1.1rem', marginTop: '-0.2rem' }}>
            {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
            {props.friendsInfo.username}
          </div>
          <div style={{ marginTop: '-0.4rem', fontSize: '0.9rem' }}>
            {props.friendsInfo.introduceName}
          </div>
        </div>
      </ListItem>
    </div>
  );
};

export default ChatRoomHeader;
