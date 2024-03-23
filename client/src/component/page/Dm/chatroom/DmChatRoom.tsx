import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authHoc } from '../../../../common/auth.hoc';
import { Socket, io } from 'socket.io-client';
import MessageInput from '../chatroom/MessageInput';
import { DirectMessage, DirectUserInfo } from '../interfaces';
import ChatRoomHeader from './ChatRoomHeader';
import MessageBoard from './MessageBoard/MessageBoard';

const DmChatRoom = () => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams();

  const [dmsocket, setSocket] = useState<Socket | undefined>(undefined);

  const [friendsInfo, setFriendsInfo] = useState<DirectUserInfo>({
    userId: 0,
    username: '',
    introduce: '',
    introduceName: '',
    img: '',
  });
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [getMessageTrigger, setGetMessageTrigger] = useState<boolean>(false);
  const [lastId, setLastId] = useState<number | undefined>(undefined);

  const getMessages = (startAt?: number) => {
    if (hasMore === false) {
      console.log(hasMore);
      return;
    }
    dmsocket?.emit('getMessages', { startAt: lastId });
  };

  useEffect(() => {
    if (isNaN(Number(chatRoomId))) {
      alert('worng location');
      navigate(-1);
    }

    authHoc().then((res) => {
      if (res.success === false) {
        alert('auth faild');
        navigate('/signin');

        return;
      }

      const socket = io({
        path: '/dm/socket.io',
        extraHeaders: {
          userid: res.userId,
          location: chatRoomId === undefined ? '' : chatRoomId,
        },
      });

      //room owner check 실패 시 튕김
      socket.on('cannotEnter', () => {
        console.log(1);
        socket.close();
        alert('cannot enter chat room');
        navigate('/direct/inbox');
        return;
      });

      socket.on('getFriendsInfo', (data: { friendsInfo: DirectUserInfo }) => {
        setFriendsInfo(data.friendsInfo);
      });

      socket.on('getMessages', (data: { messages: DirectMessage[] }) => {
        if (data.messages.length === 0) {
          return;
        }

        setLastId(data.messages[0].id - 1);
        if (data.messages.length < 15) {
          setHasMore(false);
        }

        setMessages((prevMessages) => {
          return [...data.messages, ...prevMessages];
        });
      });

      socket.on('init', () => {
        setSocket(socket);
      });

      socket.emit('getMessages', { startAt: lastId });
    });

    return () => {
      if (dmsocket) {
        dmsocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    getMessages();
  }, [getMessageTrigger]);

  //소켓연결해서 state controller 에 userId: chatroomId로 등록하고
  //채팅 상대 정보 + 채팅이력 불러오기

  return (
    <div>
      <ChatRoomHeader friendsInfo={friendsInfo} />
      <div style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <MessageBoard
          messages={messages}
          getMessages={getMessages}
          setGetMessageTrigger={setGetMessageTrigger}
        />
      </div>
      <div>
        <MessageInput socket={dmsocket} />
      </div>
    </div>
  );
};

export default DmChatRoom;
