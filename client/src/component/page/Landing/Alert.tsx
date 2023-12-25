import { Avatar, ListItem, ListItemAvatar, Tab, Tabs } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { AlertContentUnion } from 'sns-interfaces/alert.interface';
import { requestUrl } from '../../../common/etc';
import sample from '../../../asset/sample1.jpg';
import { getElapsedTimeString } from '../../../common/date.parser';
import { useNavigate } from 'react-router-dom';
import { MetadataDto } from 'sns-interfaces';
import InfiniteScroll from 'react-infinite-scroll-component';

const pageLen = 20;

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AlertComponent = (props: { userId: string }) => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    //뒤로가기 막기 위해 아래코드 필요.
    window.history.pushState(null, document.title, window.location.href);
  }, []);
  return (
    <div>
      <Tabs
        variant='fullWidth'
        value={tabIndex}
        onChange={handleTabChange}
        aria-label='basic tabs example'
        centered
      >
        <Tab label={`안 읽은 알림`} {...a11yProps(0)} />
        <Tab label={`전체 알림`} {...a11yProps(1)} />
      </Tabs>
      <UnReadAlertPannel index={0} value={tabIndex} userId={props.userId} />
      <AllAlertPannel index={1} value={tabIndex} userId={props.userId} />
    </div>
  );
};

const UnReadAlertPannel = (props: {
  index: number;
  value: number;
  userId: string;
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<
    {
      _id: string;
      content: AlertContentUnion & {
        userinfo: { username: string; img: string };
        img?: string;
      };
      read: boolean;
      createdAt: Date;
    }[]
  >([]);

  const getAlerts = () => {
    axios.post('/gateway/alert/getUnreadAlert', { page }).then((res) => {
      console.log(1);
      const data: {
        unreadAlerts: {
          _id: string;
          content: AlertContentUnion & {
            userinfo: { username: string; img: string };
            img?: string;
          };
          read: boolean;
          createdAt: Date;
        }[];
      } = res.data;

      if (data.unreadAlerts.length < pageLen) {
        setHasMore(false);
      }

      setPage(page + 1);
      const origin = [...alerts];
      setAlerts([...origin, ...data.unreadAlerts]);

      const tmpAlerts = data.unreadAlerts;

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

        axios
          .post('/gateway/metadata/getMetadatasByPostId', { _ids: [postId] })
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
    getAlerts();
  }, []);

  const renderAlerts = alerts.map((item, index) => {
    if (item.content.type === 'follow') {
      return (
        <ListItem
          key={index}
          onClick={() => {
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

    if (item.content.type === 'like') {
      const postId = item.content.postId;
      // axios
      //   .post('/gateway/metadata/getMetadatasByPostId', { _ids: [postId] })
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

    if (item.content.type === 'comment') {
      const postId = item.content.postId;
      const commentId = item.content.commentId;
      // axios
      //   .post('/gateway/metadata/getMetadatasByPostId', { _ids: [postId] })
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
        // axios
        //   .post('/gateway/metadata/getMetadatasByPostId', { _ids: [postId] })
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
          next={getAlerts}
          hasMore={hasMore}
          loader={<></>}
          dataLength={alerts.length}
          scrollThreshold={'100%'}
        >
          {renderAlerts}
        </InfiniteScroll>
      </div>
    </div>
  );
};

const AllAlertPannel = (props: {
  index: number;
  value: number;
  userId: string;
}) => {
  return (
    <div
      role='tabpanel'
      hidden={props.value !== props.index}
      id={`simple-tabpanel-${props.index}`}
      aria-labelledby={`simple-tab-${props.index}`}
      style={{ display: props.value === props.index ? 'block' : 'none' }}
    >
      this is all
    </div>
  );
};

export default AlertComponent;
