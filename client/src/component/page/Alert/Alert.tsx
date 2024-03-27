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
import { authHoc } from '../../../common/auth.hoc';
import AllAlertPanel from './panel/AllAlertPanel';
import UnReadAlertPanel from './panel/UnreadAlert';

export const AlertPageLen = 20;

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AlertComponent = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [userId, setUserId] = useState<string>('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    authHoc();
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
      <UnReadAlertPanel index={0} value={tabIndex} userId={userId} />
      <AllAlertPanel index={1} value={tabIndex} userId={userId} />
    </div>
  );
};

export default AlertComponent;
