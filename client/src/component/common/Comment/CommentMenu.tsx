import { Grid, IconButton, Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import AddIcon from '@mui/icons-material/Add';
import { forwardRef, useState } from 'react';
import axios from 'axios';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

const CommentMenu = (props: {
  commentId: number;
  postId?: string;
  cocommentId?: number;
  type: 'comment' | 'cocomment';
}) => {
  const [snackOpen, setSnackOpen] = useState(false);

  const handleSnackClick = () => {
    setSnackOpen(true);
  };

  const handleSnackClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackOpen(false);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const requestDeleteComment = () => {
    axios.post('/gateway/post/deleteComment', {
      commentId: String(props.commentId),
      postId: props.postId,
    });
  };

  const requestDeleteCocomment = () => {
    axios.post('/gateway/post/deleteCocomment', {
      commentId: String(props.commentId),
      cocommentId: String(props.cocommentId),
    });
  };

  return (
    <div style={{ marginTop: '-0.5rem' }}>
      <IconButton
        id='basic-button'
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <ExpandMoreIcon />
      </IconButton>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            props.type === 'comment'
              ? requestDeleteComment()
              : requestDeleteCocomment();
            handleSnackClick();
          }}
        >
          댓글 삭제
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={handleSnackClose}
      >
        <Alert
          onClose={handleSnackClose}
          severity='success'
          sx={{ width: '100%', marginBottom: '4rem' }}
        >
          Delete request sended.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CommentMenu;
