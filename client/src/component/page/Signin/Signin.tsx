import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { SignInDto, AuthResultRes } from 'sns-interfaces';
import { Link, useNavigate } from 'react-router-dom';
import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  TextField,
} from '@mui/material';
import { authHoc } from '../../../common/auth.hoc';
import Navbar from '../../common/Navbar/Navbar';
import { axiosInstance } from '../../../App';

const Signin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('hoontou@gmail.com');
  const [password, setPassword] = useState('test');
  const [openBackSpin, setOpenBackSpin] = useState<boolean>(false);

  const onEmailHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value);
  };
  const onPasswordHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
  };

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setOpenBackSpin(true);
    const signInForm: SignInDto = {
      email,
      password,
    };
    axiosInstance.post('/gateway/auth/signin', signInForm).then((res) => {
      const result: AuthResultRes = res.data;
      if (result.success === true) {
        navigate('/');
        return;
      }
      if (result.success === false) {
        setOpenBackSpin(false);
        alert('login failed');
      }
    });
  };

  useEffect(() => {
    //다른곳에서는 실패하면 /signin으로 이동하게.
    authHoc().then((authRes) => {
      if (authRes.success === true) {
        alert('이미 로그인 상태입니다.');
        navigate('/');
        return;
      }
    });
  }, []);

  return (
    <div
      className='container text-center'
      style={{ width: '90%', margin: '1.5rem auto' }}
    >
      로그인
      <hr></hr>
      <div>
        <form onSubmit={onSubmitHandler}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                sx={{ m: 1, width: '30ch' }}
                id='standard-basic'
                label='Email'
                variant='standard'
                onChange={onEmailHandler}
                type='email'
                defaultValue={'hoontou@gmail.com'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{ m: 1, width: '30ch' }}
                id='standard-basic'
                label='password'
                variant='standard'
                onChange={onPasswordHandler}
                defaultValue={'test'}
                type='password'
              />
            </Grid>
          </Grid>
          <div style={{ marginTop: '0.5rem' }}>
            <Button
              variant='outlined'
              size='medium'
              type='submit'
              sx={{ m: 1, width: '10ch' }}
            >
              Login
            </Button>
          </div>
          <Link
            style={{ textDecoration: 'none', fontSize: '0.8rem' }}
            to='/signup'
          >
            or Sign Up
          </Link>
        </form>
      </div>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackSpin}
      >
        <div>로그인 중....&nbsp;&nbsp;&nbsp;</div>
        <CircularProgress color='inherit' />
      </Backdrop>
    </div>
  );
};

export default Signin;
