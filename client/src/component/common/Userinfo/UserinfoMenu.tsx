import { Grid, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

const UserinfoMenu = (props: { userId: string }) => {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies([
    'createdAt',
    'Authorization',
  ]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const logoutAction = () => {
    removeCookie('Authorization', { path: '/' });
    removeCookie('createdAt', { path: '/' });
    navigate('/signin');
  };

  return (
    <>
      <Grid item xs={3} className='text-end'>
        <AddIcon />
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
            href={`/usersetting/${props.userId}`}
            style={{ color: 'black', textDecoration: 'none' }}
          >
            내정보 수정
          </a>
        </MenuItem>
        <MenuItem onClick={handleClose}>팔로우 관리</MenuItem>
        <MenuItem onClick={handleClose}>
          <span onClick={logoutAction}>로그아웃</span>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserinfoMenu;
