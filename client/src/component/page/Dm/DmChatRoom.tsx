import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authHoc } from '../../../common/auth.hoc';
import { Socket, io } from 'socket.io-client';

const DmChatRoom = () => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams();
  const [userId, setUserId] = useState<string>('');
  const [dmServerSocket, setDmserverSocket] = useState<Socket | undefined>(
    undefined
  );

  const connectSocket = (userId: string) => {
    if (dmServerSocket !== undefined) {
      return;
    }
    const socket = io({
      path: '/dm/socket.io',
      extraHeaders: {
        userid: userId,
      },
    });

    //room owner check 실패 시 튕김
    socket.on('cannotEnter', () => {
      alert('cannot enter chat room');
      navigate('/');
      //인박스 구현 후
      // navigate('/direct/inbox');
    });

    setDmserverSocket(socket);
    return;
  };

  const sendDirectMessage = () => {};

  useEffect(() => {
    authHoc().then((res) => {
      if (res.success === false) {
        alert('auth faild');
        navigate('/signin');

        return;
      }

      setUserId(res.userId);
      connectSocket(res.userId);
      dmServerSocket?.emit('enterChatRoom', { chatRoomId });
    });

    // 컴포넌트 나갈때 소켓종료
    return () => {
      dmServerSocket?.close();
    };
  });

  //소켓연결해서 state controller 에 userId: chatroomId로 등록하고
  //채팅 상대 정보 + 채팅이력 불러오기

  return (
    <div>
      this is dm chat room {chatRoomId}
      <div>
        <input></input>
        <button>메세지 보내기</button>
      </div>
    </div>
  );
};

export default DmChatRoom;
