import { Avatar, ListItem, ListItemAvatar } from '@mui/material';
import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';
import { MetadataDto } from 'sns-interfaces';
import { AlertContentUnion } from 'sns-interfaces/alert.interface';
import { getElapsedTimeString } from '../../../../common/date.parser';
import { requestUrl } from '../../../../common/etc';
import sample from '../../../../asset/sample1.jpg';
import { AlertPageLen } from '../Alert';
import { axiosInstance } from '../../../../App';

const AllAlertPanel = (props: { index: number; value: number }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<
    | {
        _id: string;
        content: AlertContentUnion & {
          userinfo: { username: string; img: string };
          img?: string;
        };
        read: boolean;
        createdAt: Date;
      }[]
    | undefined
  >(undefined);

  const getAllAlerts = () => {
    axiosInstance.post('/alert/getAllAlert', { page }).then((res) => {
      const data: {
        allAlerts: {
          _id: string;
          content: AlertContentUnion & {
            userinfo: { username: string; img: string };
            img?: string;
          };
          read: boolean;
          createdAt: Date;
        }[];
      } = res.data;

      if (data.allAlerts.length < AlertPageLen) {
        setHasMore(false);
      }

      setPage(page + 1);
      const origin = alerts === undefined ? [] : [...alerts];
      setAlerts([...origin, ...data.allAlerts]);

      const tmpAlerts = data.allAlerts;

      //알람 가져온 후, 포스트 관련 알람이면 미리보기 이미지 가져옴
      tmpAlerts.map(async (item, index) => {
        if (
          item.content.type === 'follow' ||
          item.content.type === 'cocomment'
        ) {
          return;
        }

        if (item.content.type === 'tag' && item.content.where !== 'post') {
          return;
        }

        const postId =
          item.content.type === 'tag'
            ? item.content.whereId
            : item.content.postId;

        axiosInstance
          .post('/metadata/getMetadatasByPostId', { _ids: [postId] })
          .then((res) => {
            const result: {
              metadatas: MetadataDto[];
            } = res.data;
            const img = result.metadatas[0].files[0];
            tmpAlerts[index].content.img = `${requestUrl}/${postId}/${img}`;
          });
        return;
      });

      //도저히 게시물 사진 채우는게 안되서 오만짓 다하다가 이상한 형태로 구현했음
      setTimeout(() => {
        setAlerts([...origin, ...tmpAlerts]);
      }, 500);
    });
  };

  useEffect(() => {
    if (props.value === props.index && alerts === undefined) {
      getAllAlerts();
    }
  }, [props.value]);

  const renderAlerts = alerts?.map((item, index) => {
    //팔로우 알림
    if (item.content.type === 'follow') {
      return (
        <ListItem
          key={index}
          onClick={(e) => {
            navigate(`/feed/${item.content.userinfo.username}`);
          }}
        >
          <ListItemAvatar>
            <Avatar
              sx={{ width: 50, height: 50 }}
              alt={String(index)}
              src={
                item.content.userinfo.img === ''
                  ? sample
                  : `${requestUrl}/${item.content.userinfo.img}`
              }
            ></Avatar>
          </ListItemAvatar>
          <div>
            <div>{item.content.userinfo.username}님이 나를 팔로우합니다.</div>
            <div style={{ fontSize: '0.7rem' }}>
              {getElapsedTimeString(item.createdAt)}
            </div>
          </div>
        </ListItem>
      );
    }
    //좋아요 알림
    if (item.content.type === 'like') {
      const postId = item.content.postId;
      // axiosInstance
      //   .post('/metadata/getMetadatasByPostId', { _ids: [postId] })
      //   .then((res) => {
      //     const result: {
      //       metadatas: MetadataDto[];
      //     } = res.data;
      //     const img = result.metadatas[0].files[0];
      //     imgs[index] = `${requestUrl}/${postId}/${img}`;
      //   });

      return (
        <ListItem
          key={index}
          onClick={() => {
            navigate(`/post/${postId}`);
          }}
        >
          <ListItemAvatar>
            <Avatar
              sx={{ width: 50, height: 50 }}
              alt={String(index)}
              src={
                item.content.userinfo.img === ''
                  ? sample
                  : `${requestUrl}/${item.content.userinfo.img}`
              }
            ></Avatar>
          </ListItemAvatar>
          <div>
            <div>
              {item.content.userinfo.username}님이 내 게시물을 좋아합니다.
            </div>
            <div style={{ fontSize: '0.7rem' }}>
              {getElapsedTimeString(item.createdAt)}
            </div>
          </div>
          <img
            alt={postId}
            src={item.content.img === undefined ? sample : item.content.img}
            style={{
              height: '53px',
              width: '40px',
              position: 'absolute',
              right: '10%',
              objectFit: 'cover',
            }}
          />
        </ListItem>
      );
    }
    //댓 알림
    if (item.content.type === 'comment') {
      const postId = item.content.postId;
      const commentId = item.content.commentId;
      // axiosInstance
      //   .post('/metadata/getMetadatasByPostId', { _ids: [postId] })
      //   .then((res) => {
      //     const result: {
      //       metadatas: MetadataDto[];
      //     } = res.data;
      //     const img = result.metadatas[0].files[0];
      //     imgs[index] = `${requestUrl}/${postId}/${img}`;
      //   });

      return (
        <ListItem
          key={index}
          onClick={() => {
            navigate(`/comment/${commentId}`);
          }}
        >
          <ListItemAvatar>
            <Avatar
              sx={{ width: 50, height: 50 }}
              alt={String(index)}
              src={
                item.content.userinfo.img === ''
                  ? sample
                  : `${requestUrl}/${item.content.userinfo.img}`
              }
            ></Avatar>
          </ListItemAvatar>
          <div>
            <div>
              {item.content.userinfo.username}님이 내 게시물에 댓글을
              남겼습니다.
            </div>
            <div style={{ fontSize: '0.7rem' }}>
              {getElapsedTimeString(item.createdAt)}
            </div>
          </div>
          <img
            alt={postId}
            src={item.content.img === undefined ? sample : item.content.img}
            style={{
              height: '53px',
              width: '40px',
              position: 'absolute',
              right: '10%',
              objectFit: 'cover',
            }}
          />
        </ListItem>
      );
    }
    //대댓 알림
    if (item.content.type === 'cocomment') {
      const cocommentId = item.content.cocommentId;

      return (
        <ListItem
          key={index}
          onClick={() => {
            navigate(`/cocomment/${cocommentId}`);
          }}
        >
          <ListItemAvatar>
            <Avatar
              sx={{ width: 50, height: 50 }}
              alt={String(index)}
              src={
                item.content.userinfo.img === ''
                  ? sample
                  : `${requestUrl}/${item.content.userinfo.img}`
              }
            ></Avatar>
          </ListItemAvatar>
          <div>
            <div>
              {item.content.userinfo.username}님이 내 댓글에 답글을 남겼습니다.
            </div>
            <div style={{ fontSize: '0.7rem' }}>
              {getElapsedTimeString(item.createdAt)}
            </div>
          </div>
        </ListItem>
      );
    }
    if (item.content.type === 'tag') {
      if (item.content.where === 'comment') {
        const commentId = item.content.whereId;
        return (
          <ListItem
            key={index}
            onClick={() => {
              navigate(`/comment/${commentId}`);
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{ width: 50, height: 50 }}
                alt={String(index)}
                src={
                  item.content.userinfo.img === ''
                    ? sample
                    : `${requestUrl}/${item.content.userinfo.img}`
                }
              ></Avatar>
            </ListItemAvatar>
            <div>
              <div>
                {item.content.userinfo.username}님이 나를 댓글에 태그했습니다.
              </div>
              <div style={{ fontSize: '0.7rem' }}>
                {getElapsedTimeString(item.createdAt)}
              </div>
            </div>
          </ListItem>
        );
      }
      if (item.content.where === 'cocomment') {
        const cocommentId = item.content.whereId;
        return (
          <ListItem
            key={index}
            onClick={() => {
              navigate(`/cocomment/${cocommentId}`);
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{ width: 50, height: 50 }}
                alt={String(index)}
                src={
                  item.content.userinfo.img === ''
                    ? sample
                    : `${requestUrl}/${item.content.userinfo.img}`
                }
              ></Avatar>
            </ListItemAvatar>
            <div>
              <div>
                {item.content.userinfo.username}님이 나를 답글에 태그했습니다.
              </div>
              <div style={{ fontSize: '0.7rem' }}>
                {getElapsedTimeString(item.createdAt)}
              </div>
            </div>
          </ListItem>
        );
      }
      if (item.content.where === 'post') {
        const postId = item.content.whereId;
        // axiosInstance
        //   .post('/metadata/getMetadatasByPostId', { _ids: [postId] })
        //   .then((res) => {
        //     const result: {
        //       metadatas: MetadataDto[];
        //     } = res.data;
        //     const img = result.metadatas[0].files[0];
        //     imgs[index] = `${requestUrl}/${postId}/${img}`;
        //   });

        return (
          <ListItem
            key={index}
            onClick={() => {
              navigate(`/post/${postId}`);
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{ width: 50, height: 50 }}
                alt={String(index)}
                src={
                  item.content.userinfo.img === ''
                    ? sample
                    : `${requestUrl}/${item.content.userinfo.img}`
                }
              ></Avatar>
            </ListItemAvatar>
            <div>
              <div>
                {item.content.userinfo.username}님이 게시물에 나를 태그했습니다.
              </div>
              <div style={{ fontSize: '0.7rem' }}>
                {getElapsedTimeString(item.createdAt)}
              </div>
            </div>
            <img
              alt={String(postId)}
              src={item.content.img === undefined ? sample : item.content.img}
              style={{
                height: '53px',
                width: '40px',
                position: 'absolute',
                right: '10%',
                objectFit: 'cover',
              }}
            />
          </ListItem>
        );
      }
    }
    return <></>;
  });

  return (
    <div
      role='tabpanel'
      hidden={props.value !== props.index}
      id={`simple-tabpanel-${props.index}`}
      aria-labelledby={`simple-tab-${props.index}`}
      style={{
        display: props.value === props.index ? 'block' : 'none',
      }}
    >
      <div>
        <InfiniteScroll
          next={getAllAlerts}
          hasMore={hasMore}
          loader={<></>}
          dataLength={alerts === undefined ? 0 : alerts.length}
          scrollThreshold={'100%'}
        >
          {renderAlerts}
        </InfiniteScroll>
      </div>
      {alerts?.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            fontSize: '1rem',
            color: 'gray',
            marginTop: '2rem',
          }}
        >
          아무것도 없어요
        </div>
      )}
    </div>
  );
};

export default AllAlertPanel;
