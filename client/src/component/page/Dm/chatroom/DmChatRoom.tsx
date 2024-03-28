import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authHoc } from '../../../../common/auth.hoc';
import { Socket, io } from 'socket.io-client';
import MessageInput from '../chatroom/MessageInput';
import { DirectMessage, DirectUserInfo } from '../interfaces';
import ChatRoomHeader from './ChatRoomHeader';
import './DmChatRoom.css';
import MessageCard from './MessageCard';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IoArrowDownOutline } from 'react-icons/io5';

const DmChatRoom = () => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
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
  const [lastId, setLastId] = useState<number | undefined>(undefined);
  const [pageHeight, setPageHeight] = useState<number>(
    window.innerHeight - 110
  );
  const [processedMessage, setProcessedMessage] = useState<
    { tmpId: number; state: 'success' | 'fail'; isRead?: boolean } | undefined
  >(undefined);
  const [readSignal, setReadSignal] = useState<boolean>(false);
  const [showingNewMessageButton, setShowingNewMessageButton] =
    useState<boolean>(false);
  const [showingDownButton, setShowingDownButton] = useState<boolean>(false);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const findIndexByTmpId = (targetTmpId: number) => {
    return messages.findIndex((item) => item.tmpId === targetTmpId);
  };

  //창크기 변경시 messageBoard 높이변경
  const handleResize = () => {
    setPageHeight(window.innerHeight - 110);
  };

  const getMessages = () => {
    if (hasMore === false) {
      return;
    }
    dmsocket?.emit('getMessages', { startAt: lastId });
  };

  const addNewMessage = (message: DirectMessage) => {
    setMessages((prevMessages) => {
      return [message, ...prevMessages];
    });
  };

  useEffect(() => {
    const watchingScrollTarget = document.getElementById('scrollableDiv');

    const handleScroll = () => {
      if (watchingScrollTarget)
        setScrollPosition(watchingScrollTarget.scrollTop);
    };

    window.addEventListener('scroll', handleScroll);

    if (isNaN(Number(chatRoomId))) {
      alert('worng location');
      navigate(-1);
    }
    window.addEventListener('resize', handleResize);

    authHoc().then((res) => {
      if (res.success === false) {
        alert('auth faild');
        navigate('/signin');

        return;
      }

      const socket = io({
        path: '/direct/socket.io',
        extraHeaders: {
          userid: res.userId,
          location: chatRoomId === undefined ? '' : chatRoomId,
        },
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
        if (data.messages.length < 40) {
          setHasMore(false);
        }

        if (data.messages.length === 0) {
          return;
        }

        setLastId(data.messages[data.messages.length - 1].id - 1);

        setMessages((prevMessages) => {
          return [...prevMessages, ...data.messages];
        });
      });

      socket.on('receiveNewMessage', (data: { message: DirectMessage }) => {
        setMessages((prev) => {
          return [data.message, ...prev];
        });
        if (!watchingScrollTarget) {
          return;
        }

        if (watchingScrollTarget.scrollTop < -200) {
          setShowingNewMessageButton(true);
          return;
        }

        //맨밑 내려가는거 바로하면 제대로 안가져서 딜레이시킴
        setTimeout(() => {
          scrollToBottom();
        }, 200);

        return;
      });

      //전송에 성공이든 실패든, signal 받으면 tmpId를 -1로 바꿔야함
      //tmpId 보고 spinning 돌릴 지 판단.
      //전송 실패시 글을 '전송실패'로 바꾸기
      socket.on(
        'sendingSuccess',
        (data: { tmpId: number; isRead: boolean }) => {
          setProcessedMessage({
            tmpId: data.tmpId,
            state: 'success',
            isRead: data.isRead,
          });
          return;
        }
      );
      socket.on('sendingFailed', (data: { tmpId: number }) => {
        setProcessedMessage({ tmpId: data.tmpId, state: 'fail' });

        return;
      });

      socket.on('readSignal', (data: any) => {
        setReadSignal(true);
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
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (processedMessage === undefined) {
      return;
    }

    //state의 인덱스로 접근해서 값 바꾸는건 정상적이지 않음
    //리액트가 감지를 못하는거같음. 하지만, 리액트가 감지를 하던말던
    //내부적으로 값은 바꼈을거 같고, 리렌더링만 하면되니까
    //그냥 얕은복사로 던져주면 변경감지하고 리렌더링 할거같았는데
    //진짜 됨ㅋㅋ

    const targetIndex = findIndexByTmpId(processedMessage.tmpId);
    messages[targetIndex].tmpId = -1;
    messages[targetIndex].isRead = processedMessage.isRead
      ? processedMessage.isRead
      : false;
    if (processedMessage.state === 'fail') {
      messages[targetIndex].content = '전송 실패';
    }

    setMessages((prev) => {
      return [...prev];
    });
  }, [processedMessage]);

  useEffect(() => {
    if (readSignal === false) {
      return;
    }

    //내 메세지를 상대가 읽었다는 시그널 온거임
    const tmp = messages.map((i) => {
      if (i.isMyChat) {
        i.isRead = true;
      }
      return i;
    });

    setMessages(tmp);
  }, [readSignal]);

  useEffect(() => {
    if (scrollPosition > -150) {
      setShowingDownButton(false);
      return;
    }
    setShowingDownButton(true);
  }, [scrollPosition]);

  //소켓연결해서 state controller 에 userId: chatroomId로 등록하고
  //채팅 상대 정보 + 채팅이력 불러오기

  const renderCards = messages.map((item, index) => (
    <MessageCard
      // state=''
      message={item}
      key={index}
      displayDate={
        index === messages.length - 1 ||
        item.createdAt.slice(0, 10) !==
          messages[index + 1].createdAt.slice(0, 10)
      }
      displayTime={
        index === 0 ||
        item.createdAt.slice(8, 16) !==
          messages[index - 1].createdAt.slice(8, 16) ||
        item.isMyChat !== messages[index - 1].isMyChat
      }
    />
  ));

  return (
    <div>
      <ChatRoomHeader friendsInfo={friendsInfo} />
      <div
        className='chat'
        style={{
          paddingTop: '3rem',
          paddingBottom: '3rem',
        }}
      >
        <div
          className='messages-chat'
          id='scrollableDiv'
          style={{
            height: pageHeight,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse',
            marginTop: '1rem',
          }}
        >
          <div ref={bottomRef}></div>

          <InfiniteScroll
            dataLength={messages.length}
            next={getMessages}
            style={{ display: 'flex', flexDirection: 'column-reverse' }} //To put endMessage and loader to the top.
            inverse={true} //
            hasMore={hasMore}
            loader={
              <div
                style={{ marginTop: '1.5rem', marginBottom: '1rem' }}
                className='spinner'
              ></div>
            }
            scrollableTarget='scrollableDiv'
            onScroll={(e: any) => {
              setScrollPosition(e.target.scrollTop);
            }}
          >
            {renderCards}
          </InfiniteScroll>
        </div>
      </div>

      {showingNewMessageButton && (
        <button
          id='floatingButton'
          onClick={() => {
            scrollToBottom();
            setShowingNewMessageButton(false);
          }}
        >
          새 메세지
        </button>
      )}
      {showingDownButton && (
        <div className='floating-down-button' onClick={scrollToBottom}>
          <IoArrowDownOutline style={{ color: 'rgba(0, 0, 0, 0.5)' }} />
        </div>
      )}
      <div>
        <MessageInput socket={dmsocket} addNewMessage={addNewMessage} />
      </div>
    </div>
  );
};

export default DmChatRoom;
