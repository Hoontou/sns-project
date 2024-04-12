import { Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { authHoc } from '../../../common/auth.hoc';
import AllAlertPanel from './panel/AllAlertPanel';
import UnReadAlertPanel from './panel/UnreadAlert';
import Navbar from '../../common/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

export const AlertPageLen = 20;

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AlertComponent = () => {
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    authHoc().then((authRes) => {
      if (authRes.success === false) {
        alert('Err while Authentication, need login');
        navigate('/signin');
        return;
      }
    });
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
      <UnReadAlertPanel index={0} value={tabIndex} />
      <AllAlertPanel index={1} value={tabIndex} />

      <div style={{ paddingTop: '4rem' }}>
        <Navbar value={0} />
      </div>
    </div>
  );
};

export default AlertComponent;
