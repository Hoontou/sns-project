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
          paddingTop: '0.5rem',
        }}
        className='text-center'
      >
        <span style={{ fontWeight: '600', fontSize: '1.2rem' }}>
          {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
          {title()}
        </span>
      </div>
      {type === 'like' ? <LikeTab /> : <FollowTab />}

      <div></div>
    </div>
  );
};

//userId, type, page 날려서 유저리스트 계속 가져오고,
//검색창 추가로 둬서 몽고 population 구현한거 이용해서 검색기능 적용
//검색기능은 자원 많이잡아먹을거기 때문에, 딜레이를 좀 걸자.

//유저리스트 가져오는건 userlistmodal에 있는 함수 그대로 쓰면 된다.
//usercard 만드는것도 가져오면 됨.

//일단 검색인풋 넣기보다, 무한스크롤로 리스트 가져오는것부터 구현
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

const LikeTab = () => {
  return <div>this is LikeTab</div>;
};
