import { Box, Tab, Tabs } from '@mui/material';
import { Dispatch, useState } from 'react';
import { PostPanel } from './panel/post/PostPanel';
import { TagPanel } from './panel/tag/TagPanel';
import { UserPanel } from './panel/user/UserPanel';
import { Height } from '@mui/icons-material';
import SearchBar from '../SearchBar';

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

export const SearchTap = (props: {
  searchString: string | undefined;
  userId: string;
  setOpenSearchModal: Dispatch<React.SetStateAction<boolean>>;
  openSearchModal: boolean;
  defaultValue?: string;
}) => {
  const [value, setValue] = useState<number>(0); //패널 선택

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <div>
      <div
        style={{
          position: 'fixed',
          width: '100%',
          backgroundColor: 'white',
          zIndex: '800',
        }}
      >
        {/* 도저히 검색인풋 넓이조절이 안돼서 삽질하다가 되는대로 구현했음, 코드개판임 */}
        {/* 원래 SearchBar 컴포넌트는 부모에 있었음, props도 단지 searchbar에 넘기기 위해서 받아온것들임 */}
        <div
          style={{
            margin: '0 auto',
            width: '95%',
            paddingTop: '0.5rem',
          }}
        >
          <SearchBar
            setOpenSearchModal={props.setOpenSearchModal}
            openSearchModal={props.openSearchModal}
            defaultValue={props.searchString}
          />
        </div>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            variant='fullWidth'
            value={value}
            onChange={handleChange}
            aria-label='basic tabs example'
            centered
          >
            <Tab label='게시물' {...a11yProps(0)} />
            <Tab label='유저' {...a11yProps(1)} />
            <Tab label='태그' {...a11yProps(2)} />
          </Tabs>
        </Box>
      </div>
      <div style={{ paddingTop: '6rem' }}>
        {/* <div style={{ height: '1rem' }}></div> */}
        <PostPanel
          userId={props.userId}
          value={value}
          index={0}
          searchString={props.searchString}
        />
        <UserPanel
          userId={props.userId}
          value={value}
          index={1}
          searchString={props.searchString}
        />

        <TagPanel
          userId={props.userId}
          value={value}
          index={2}
          searchString={props.searchString}
        />
      </div>
    </div>
  );
};
