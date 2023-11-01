import { Box, Tab, Tabs } from '@mui/material';
import { Dispatch, useState } from 'react';
import { PostPannel } from './pannel/post/PostPannel';
import { TagPannel } from './pannel/tag/TagPannel';
import { UserPannel } from './pannel/user/UserPannel';
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
        <PostPannel
          userId={props.userId}
          value={value}
          index={0}
          searchString={props.searchString}
        />
        <UserPannel
          userId={props.userId}
          value={value}
          index={1}
          searchString={props.searchString}
        />

        <TagPannel
          userId={props.userId}
          value={value}
          index={2}
          searchString={props.searchString}
        />
      </div>
    </div>
  );
};
