import { useState } from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
const Navbar = (props: { value: number }) => {
  const [value, setValue] = useState(props.value);
  return (
    <div>
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction label='홈' icon={<HomeIcon />} href='/' />
          <BottomNavigationAction
            label='검색'
            icon={<SearchIcon />}
            href='/searchpli'
          />
          <BottomNavigationAction
            label='컬렉션'
            icon={<FavoriteIcon />}
            href='/collections'
          />
          <BottomNavigationAction
            label='업로드'
            icon={<AddIcon />}
            href='/up'
          />
          <BottomNavigationAction
            label='내 서랍'
            icon={<PersonIcon />}
            href='/myvibe'
          />
        </BottomNavigation>
      </Paper>
    </div>
  );
};

export default Navbar;
