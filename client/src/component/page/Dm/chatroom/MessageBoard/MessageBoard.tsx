import { Dispatch, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DirectMessage } from '../../interfaces';
import './MessageBoard.css';
import MessageCard from './MessageCard';
import { message } from 'antd';

const MessageBoard = (props: {
  setGetMessageTrigger: Dispatch<React.SetStateAction<boolean>>;
  messages: DirectMessage[];
  getMessages: (startAt?: number) => void;
}) => {
  const [spin, setSpin] = useState<boolean>(false);
  const [isFisrtRendering, setIsFirstRendering] = useState<boolean>(true);
  //가져온것 중 제일 오래된 메세지의 id -1, 이거 다음부터 가져오란 뜻
  const endRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState<number>(0);

  const scrollToBottom = () => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'auto' });
    }
  };

  const getMessages = () => {
    if (spin) {
      return;
    }

    setSpin(true);

    props.setGetMessageTrigger((prev) => {
      return !prev;
    });
  };

  //props.message업데이트 시,
  useEffect(() => {
    if (props.messages.length === 0) {
      return;
    }

    if (isFisrtRendering === true) {
      //맨처음 로딩일 때 맨아래로
      scrollToBottom();
      setIsFirstRendering(false);
    }

    setSpin(false);
  }, [props.messages]);

  //맨처음 로딩시,
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      if (scrollTop === 0) {
        //픽셀단위임
        getMessages();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const renderCards = props.messages.map((item, index) => {
    //날짜 display
    //이전과 같은날짜면 false
    //만약 index==0이면 날짜 true

    //시간 display
    //다음과 같은 분 이면 false
    //만약 맨 마지막꺼면 index == messages.lenth-1, true

    return (
      <MessageCard
        message={item}
        key={item.id}
        displayDate={
          index === 0
            ? true
            : item.createdAt.slice(0, 10) ===
                props.messages[index - 1].createdAt.slice(0, 10) || false
        }
        displayTime={
          index === props.messages.length - 1
            ? true
            : item.createdAt.slice(8, 16) !==
                props.messages[index + 1].createdAt.slice(8, 16) || false
        } //이렇게 하면 전날 같은시각에 보낸거까진 커버 되는데, 저번달 같은시각에 보낸건 커버안됨
        //그렇다고 range 더 넓히면 자원아깝고..
      />
    );
  });

  return (
    <div className='chat' style={{ paddingTop: '1rem' }}>
      <div className='messages-chat'>
        {renderCards}
        <div ref={endRef}>{/* 맨아래 스크롤 위한 empty div */}</div>
      </div>
    </div>
  );
};

export default MessageBoard;
