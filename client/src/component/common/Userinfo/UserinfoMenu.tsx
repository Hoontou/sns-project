import { Grid, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
// import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookies } from 'react-cookie';

const UserinfoMenu = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const cookies = new Cookies();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Grid item xs={3} className='text-end'>
        {/* <AddIcon href='/up' /> */}
        <IconButton
          id='basic-button'
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          style={{ marginLeft: '0.5rem', marginRight: '-0.5rem' }}
        >
          <MenuIcon />
        </IconButton>
      </Grid>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem>
          <a
            href={'/usersetting'}
            style={{ color: 'black', textDecoration: 'none' }}
          >
            내정보 수정
          </a>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <span
            onClick={() => {
              cookies.remove('createdAt');
              cookies.remove('Authorization');
              navigate('/signin');
            }}
          >
            로그아웃
          </span>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserinfoMenu;
