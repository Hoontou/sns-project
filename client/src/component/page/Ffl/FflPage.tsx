import { useParams } from 'react-router-dom';
import { mainTemplateStyle } from '../../../App';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  searchString: string | undefined;
  userId: string;
}
export function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const FflPage = () => {
  const { target, type } = useParams();

  const title = () => {
    if (type === 'following' || 'follower') {
      return target;
    }
    if (type === 'like') {
      return '좋아요';
    }
  };

  return (
    <div>
      <div
        style={{
          paddingTop: '1rem',
        }}
        className='text-center'
      >
        <span style={{ fontWeight: '600', fontSize: '1.2rem' }}>
          {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
          {title()}
        </span>
      </div>
      <FollowTab />

      <div></div>
    </div>
  );
};

const FollowTab = () => {
  const [value, setValue] = useState<number>(0); //패널 선택

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          variant='fullWidth'
          value={value}
          onChange={handleChange}
          aria-label='basic tabs example'
          centered
        >
          <Tab label={`팔로워 ${100}명`} {...a11yProps(0)} />
          <Tab label={`팔로잉 ${100}명`} {...a11yProps(1)} />
        </Tabs>
      </Box>
    </div>
  );
};
