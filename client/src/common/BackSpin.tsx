import { Backdrop, CircularProgress } from '@mui/material';

export const BackSpin = (props: { msg: string; isOpen?: boolean }) => {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={props.isOpen ?? true}
    >
      <div>{props.msg}....&nbsp;&nbsp;&nbsp;</div>
      <CircularProgress color='inherit' />
    </Backdrop>
  );
};
