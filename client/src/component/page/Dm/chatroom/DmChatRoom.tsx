import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authHoc } from '../../../../common/auth.hoc';
import { Socket, io } from 'socket.io-client';
import MessageInput from '../chatroom/MessageInput';
import MessageBoard from './MessageBoard';
import { DirectMessage, DirectUserInfo } from '../interfaces';
import ChatRoomHeader from './ChatRoomHeader';

const DmChatRoom = () => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams();
  const [dmServerSocket, setDmserverSocket] = useState<Socket | undefined>(
    undefined
  );
  const [friendsInfo, setFriendsInfo] = useState<DirectUserInfo>({
    userId: 0,
    username: '',
    introduce: '',
    introduceName: '',
    img: '',
  });
  const [messages, setMessages] = useState<DirectMessage[]>([]);

  const connectSocket = (userId: string) => {
    if (dmServerSocket !== undefined) {
      return;
    }
    const socket = io({
      path: '/dm/socket.io',
      extraHeaders: {
        userid: userId,
        location: chatRoomId === undefined ? '' : chatRoomId,
      },
    });
    setDmserverSocket(socket);

    socket.emit('getMessages', {
      page: 0,
    });

    //room owner check 실패 시 튕김
    socket.on('cannotEnter', () => {
      socket.close();
      alert('cannot enter chat room');
      navigate('/direct/inbox');
      return;
    });

    socket.on('getFriendsInfo', (data: { friendsInfo: DirectUserInfo }) => {
      setFriendsInfo(data.friendsInfo);
    });

    socket.on('getMessages', (data: { messages: DirectMessage[] }) => {
      setMessages(() => {
        return [...data.messages, ...messages];
      });
    });

    return;
  };

  const getMessages = (startAt?: number) => {
    dmServerSocket?.emit('getMessages', {
      startAt,
    });
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

      connectSocket(res.userId);
      //연결 됐으면 메세지 기록 요청보내기
    });

    // 컴포넌트 나갈때 소켓종료
    return () => {
      dmServerSocket?.close();
    };
  }, []);

  //소켓연결해서 state controller 에 userId: chatroomId로 등록하고
  //채팅 상대 정보 + 채팅이력 불러오기

  return (
    <div>
      <ChatRoomHeader friendsInfo={friendsInfo} />
      <div style={{ paddingTop: '4rem' }}>
        <MessageBoard
          socket={dmServerSocket}
          messages={messages}
          getMessages={getMessages}
        />
      </div>
      <div>
        <MessageInput socket={dmServerSocket} />
      </div>
    </div>
  );
};

export default DmChatRoom;
