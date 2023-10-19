import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { PostPannel } from './pannel/PostPannel';
import { UserPannel } from './pannel/UserPannel';
import { TagPannel } from './pannel/TagPannel';

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  searchString: string | undefined;
}
export function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const SearchTap = (props: { searchString: string | undefined }) => {
  const [value, setValue] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <div style={{ marginTop: '0.5rem' }}>
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
      <>
        <PostPannel value={value} index={0} searchString={props.searchString} />
        <UserPannel value={value} index={1} searchString={props.searchString} />
        <TagPannel value={value} index={2} searchString={props.searchString} />
      </>
    </div>
  );
};
