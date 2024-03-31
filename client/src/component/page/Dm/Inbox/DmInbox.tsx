import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { Backdrop, CircularProgress, List } from '@mui/material';
import { VscArrowLeft } from 'react-icons/vsc';
import './DmInbox.css';
import InfiniteScroll from 'react-infinite-scroll-component';
import { authHoc } from '../../../../common/auth.hoc';
import { InboxCard } from './InboxCard';
import { ChatRoomWithUserPop } from '../interfaces';
import Navbar from '../../../common/Navbar/Navbar';

const pageItemLen = 12; //12개씩 서버에서 보내줌

const InBox = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState<number>(0);
  const [spin, setSpin] = useState<boolean>(true);
  const [chatRooms, setChatRooms] = useState<ChatRoomWithUserPop[]>([]);
  const [hasMoreChatRooms, setHasMoreChatRooms] = useState<boolean>(true);
  const [myUsername, setMyUsername] = useState<string>('');
  const [dmsocket, setSocket] = useState<Socket | undefined>(undefined);
  const [openBackSpin, setOpenBackSpin] = useState<boolean>(true);

  const updateChatRooms = (chatRoom: ChatRoomWithUserPop) => {
    setChatRooms((chatRooms) => {
      //복사해서 중복없애고 새거 맨앞에 두고 갈아끼우기
      const tmp = [...chatRooms];
      const targetIndex = tmp.findIndex((i) => {
        return i.chatRoomId === chatRoom.chatRoomId;
      });
      targetIndex !== -1 && tmp.splice(targetIndex, 1);

      return [chatRoom, ...tmp];
    });
  };

  const getChatRooms = () => {
    setSpin(true);
    dmsocket?.emit('getInbox', { page });
    setPage(page + 1);
  };

  useEffect(() => {
    authHoc().then((res) => {
      if (res.success === false) {
        alert('auth faild');
        navigate('/signin');

        return;
      }
      setMyUsername(res.username);

      const socket = io({
        extraHeaders: {
          userid: res.userId,
          location: 'inbox',
        },
      });

      socket.on('getInbox', (data: { chatRooms: ChatRoomWithUserPop[] }) => {
        if (data.chatRooms.length < pageItemLen) {
          setHasMoreChatRooms(false);
        }

        setPage(page + 1);
        setChatRooms([...chatRooms, ...data.chatRooms]);
        setSpin(false);
      });

      //3 이후 서버가 날리는 실시간 정보 받아서 업데이트

      socket.on(
        'realTimeUpdateForInbox',
        (data: { updatedChatRoom: ChatRoomWithUserPop }) => {
          updateChatRooms(data.updatedChatRoom);
        }
      );

      socket.on('init', () => {
        setSocket(socket);
        setOpenBackSpin(false);
      });
      socket.emit('getInbox', { page });

      setSpin(false);
    });

    return () => {
      if (dmsocket) {
        dmsocket.disconnect();
      }
    };
  }, []);

  const renderItem =
    chatRooms.length === 0 ? (
      <div
        style={{
          fontSize: '1.5rem',
          color: 'gray',
          justifyContent: 'center',
          display: 'flex',
          marginTop: '7rem',
        }}
      >
        아무것도 없어요.
      </div>
    ) : (
      chatRooms.map((item, index) => {
        return <InboxCard chatRoom={item} index={index} key={item._id} />;
      })
    );

  return (
    <div>
      <div
        style={{
          paddingTop: '0.5rem',
          position: 'fixed',
          zIndex: '999',
          backgroundColor: 'white',
          width: '100%',
        }}
        className='text-center'
      >
        <VscArrowLeft
          style={{
            marginBottom: '0.3rem',
            position: 'fixed',
            left: '1rem',
          }}
          onClick={() => {
            navigate(-1);
          }}
        />
        <span>{myUsername}</span>
      </div>
      <div style={{ paddingTop: '2.2rem' }}>
        <InfiniteScroll
          next={getChatRooms}
          hasMore={hasMoreChatRooms}
          loader={<div className='spinner'></div>}
          dataLength={chatRooms.length}
          scrollThreshold={'95%'}
        >
          <List sx={{ pt: 0 }} style={{ marginTop: '0.3rem' }}>
            {renderItem}
          </List>
        </InfiniteScroll>
      </div>
      <div style={{ paddingTop: '4rem' }}>
        <Navbar value={undefined} />
      </div>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackSpin}
      >
        <div>서버와 연결중....&nbsp;&nbsp;&nbsp;</div>
        <CircularProgress color='inherit' />
      </Backdrop>
    </div>
  );
};

export default InBox;
