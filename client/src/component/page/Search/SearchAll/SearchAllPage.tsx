import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import SearchBar from '../SearchBar';
import { authHoc } from '../../../../common/auth.hoc';
import Navbar from '../../../common/Navbar/Navbar';
import { CustomTabPanel, a11yProps } from './TabPanel';

const SearchAllPage = () => {
  const { searchString } = useParams(); //url에서 가져온 username

  const navigate = useNavigate();
  const [userId, setId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [value, setValue] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  //인증 effect
  useEffect(() => {
    //다른곳에서는 실패하면 /signin으로 이동하게.
    authHoc().then((authRes) => {
      if (authRes.success === false) {
        alert('Err while Authentication, need login');
        navigate('/signin');
        return;
      }
      setId(authRes.userId);
      setUsername(authRes.username !== undefined ? authRes.username : '');
    });
  }, [navigate]);

  const [openSearchModal, setOpenSearchModal] = useState<boolean>(false);
  return (
    <div
      style={{
        width: '90%',
        margin: '0.7rem auto',
        paddingBottom: '3.5rem',
      }}
    >
      <div>
        <SearchBar
          setOpenSearchModal={setOpenSearchModal}
          openSearchModal={openSearchModal}
          defaultValue={searchString}
        />
      </div>
      {!openSearchModal && (
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
          <CustomTabPanel value={value} index={0}>
            Item One
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            Item Two
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            Item Three
          </CustomTabPanel>
        </div>
      )}
      <div>
        <Navbar value={1} />
      </div>
    </div>
  );
};

export default SearchAllPage;
