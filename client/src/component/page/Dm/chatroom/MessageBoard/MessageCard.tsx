import { DirectMessage } from '../../interfaces';

const MessageCard = (props: {
  message: DirectMessage;
  displayDate: boolean;
  displayTime: boolean;
}) => {
  return (
    <>
      {props.displayDate && <Date time={props.message.createdAt} />}
      {props.message.isMyChat ? (
        <>
          <Message text={props.message.content} />
          {props.displayTime && (
            <Time
              time={`${props.message.createdAt.slice(11, 16)}${
                props.message.isRead ? ' 읽음' : ''
              }`}
            />
          )}
        </>
      ) : (
        <>
          <ResponseMessage text={props.message.content} />
          {props.displayTime && (
            <ResponseTime
              time={`${props.message.createdAt.slice(11, 16)}${
                props.message.isRead ? ' 읽음' : ''
              }`}
            />
          )}
        </>
      )}
    </>
  );
};

const Message = (props: { text: string }) => {
  return (
    <div className='message'>
      <p className='text'>{props.text}</p>
    </div>
  );
};

const ResponseMessage = (props: { text: string }) => {
  return (
    <div className='message'>
      <div className='response'>
        <p className='text'>{props.text}</p>
      </div>
    </div>
  );
};
const Time = (props: { time: string }) => {
  return <p className='time'>{props.time}</p>;
};

const ResponseTime = (props: { time: string }) => {
  return <p className='response-time time'>{props.time}</p>;
};

const Date = (props: { time: string }) => {
  const parseDate = () => {
    // 문자열에서 연, 월, 일 부분 추출
    const year = props.time.slice(0, 4);
    let month = props.time.slice(5, 7);
    let day = props.time.slice(8, 10);

    if (month.startsWith('0')) {
      month = month.slice(1);
    }
    if (day.startsWith('0')) {
      day = day.slice(1);
    }

    return `${year}년 ${month}월 ${day}일`;
  };

  return <p className='text-center date'>{parseDate()}</p>;
};

export default MessageCard;
