import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DirectMessage } from '../interfaces';

const MessageBoard = (props: {
  socket: Socket | undefined;
  messages: DirectMessage[];
  getMessages: (startAt?: number) => void;
}) => {
  const [spin, setSpin] = useState<boolean>(false);
  //가져온것 중 제일 오래된 메세지의 id -1, 이거 다음부터 가져오란 뜻
  const [idOfNextMessage, setIdOfNextMessage] = useState<number>(-1);

  const getMessages = () => {
    setSpin(true);

    props.getMessages(idOfNextMessage === -1 ? undefined : idOfNextMessage);
  };

  useEffect(() => {
    if (props.messages.length === 0) {
      return;
    }

    console.log(props.messages);

    setIdOfNextMessage(props.messages[props.messages.length - 1].id - 1);
    setSpin(false);
  }, [props.messages]);

  return (
    <div>
      this is message board{' '}
      <button
        onClick={() => {
          getMessages();
        }}
      >
        1
      </button>
    </div>
  );
};

export default MessageBoard;
