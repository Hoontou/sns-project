import { Avatar, ListItem, ListItemAvatar, Tab, Tabs } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { AlertContentUnion } from 'sns-interfaces/alert.interface';
import { requestUrl } from '../../../common/etc';
import sample from '../../../asset/sample1.jpg';
import { getElapsedTimeString } from '../../../common/date.parser';
import { useNavigate } from 'react-router-dom';

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
    <>
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
    </>
  );
};

const UnReadAlertPannel = (props: {
  index: number;
  value: number;
  userId: string;
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(0);
  const [alerts, setAlerts] = useState<
    {
      _id: string;
      content: AlertContentUnion & {
        userinfo: { username: string; img: string };
      };
      read: boolean;
      createdAt: Date;
    }[]
  >([]);

  const getAlerts = () => {
    axios.post('/gateway/alert/getUnreadAlert', { page }).then((res) => {
      const data: {
        unreadAlerts: {
          _id: string;
          content: AlertContentUnion & {
            userinfo: { username: string; img: string };
          };
          read: boolean;
          createdAt: Date;
        }[];
      } = res.data;

      console.log(data);
      setAlerts([...alerts, ...data.unreadAlerts]);
      setPage(page + 1);
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
              style={{ marginLeft: '0.7rem' }}
              alt={String(index)}
              src={
                item.content.userinfo.img === ''
                  ? sample
                  : `${requestUrl}/${item.content.userinfo.img}`
              }
            ></Avatar>
          </ListItemAvatar>
          <div style={{ marginLeft: '0.8rem' }}>
            <div>{item.content.userinfo.username}님이 나를 팔로우합니다.</div>
            <div style={{ fontSize: '0.7rem' }}>
              {getElapsedTimeString(item.createdAt)}
            </div>
          </div>
        </ListItem>
      );
    }
  });
  return (
    <div
      role='tabpanel'
      hidden={props.value !== props.index}
      id={`simple-tabpanel-${props.index}`}
      aria-labelledby={`simple-tab-${props.index}`}
      style={{ display: props.value === props.index ? 'block' : 'none' }}
    >
      this is un read
      {renderAlerts}
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
