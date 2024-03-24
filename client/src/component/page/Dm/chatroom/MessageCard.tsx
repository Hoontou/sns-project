import { useEffect } from 'react';
import { primaryColor } from '../../../../App';
import { DirectMessage } from '../interfaces';
import { ImSpinner8 } from 'react-icons/im';
const MessageCard = (props: {
  message: DirectMessage;
  displayDate: boolean;
  displayTime: boolean;
}) => {
  return (
    <div id={`${props.message.id}`}>
      {props.displayDate && <Date time={props.message.createdAt} />}
      {props.message.isMyChat ? (
        <>
          <div>
            <Message
              text={props.message.content}
              spin={
                props.message.id === -1 && props.message.tmpId !== -1
                  ? true
                  : false
              }
            />
          </div>
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
          <ResponseMessage
            text={props.message.content}
            spin={
              props.message.id === -1 && props.message.tmpId !== -1
                ? true
                : false
            }
          />
          {props.displayTime && (
            <ResponseTime
              time={`${props.message.createdAt.slice(11, 16)}${
                props.message.isRead ? ' 읽음' : ''
              }`}
            />
          )}
        </>
      )}
    </div>
  );
};

const ResponseMessage = (props: { text: string; spin: boolean }) => {
  return (
    <div className='message' style={{ position: 'relative' }}>
      <p className='text'>{props.text}</p>
      {props.spin && (
        <ImSpinner8
          style={{
            color: primaryColor,
            marginTop: 'auto',
            marginBottom: '3px',
            marginLeft: '-1.8rem',
            animation: 'rotate 1s linear infinite',
          }}
        />
      )}
    </div>
  );
};

const Message = (props: { text: string; spin: boolean }) => {
  return (
    <div className='message'>
      <div className='response'>
        {props.spin && (
          <ImSpinner8
            style={{
              color: primaryColor,
              marginTop: 'auto',
              marginBottom: '3px',
              marginRight: '-1.8rem',
              animation: 'rotate 1s linear infinite',
            }}
          />
        )}
        <p className='text'>{props.text}</p>
      </div>
    </div>
  );
};
const ResponseTime = (props: { time: string }) => {
  return <p className='time'>{props.time}</p>;
};

const Time = (props: { time: string }) => {
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
