import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authHoc } from '../../../common/auth.hoc';
import { Socket, io } from 'socket.io-client';

const DmChatRoom = () => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams();
  const [dmServerSocket, setDmserverSocket] = useState<Socket | undefined>(
    undefined
  );
  const [message, setMessage] = useState<string>('');

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

    //room owner check 실패 시 튕김
    socket.on('cannotEnter', () => {
      socket.close();
      alert('cannot enter chat room');
      navigate('/');
      //인박스 구현 후
      // navigate('/direct/inbox');
      return;
    });

    setDmserverSocket(socket);
    return;
  };

  const sendDirectMessage = () => {
    const messageForm: {
      messageType: string;
      content: string;
    } = { messageType: 'text', content: message };

    dmServerSocket?.emit('sendMessage', { messageForm });
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
      this is dm chat room {chatRoomId}
      <div>
        <input
          value={message}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setMessage(e.target.value);
          }}
        ></input>
        <button
          onClick={() => {
            sendDirectMessage(); //send
            setMessage(''); //clear input
          }}
        >
          메세지 보내기
        </button>
      </div>
    </div>
  );
};

export default DmChatRoom;
