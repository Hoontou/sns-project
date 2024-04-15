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
import { axiosInstance } from '../../../App';
import { ValidationFailedErr } from '../Signup/Signup';

const Signin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openBackSpin, setOpenBackSpin] = useState<boolean>(false);

  const tryTestAccount = (target: string) => {
    alert('다른 사용자가 이 계정으로 로그인 시 당신은 로그인 해제됩니다.');

    const testEmail = 'test' + target + '@gmail.com';
    const testPassword = 'test';

    axiosInstance
      .post('/auth/signin', { email: testEmail, password: testPassword })
      .then((res) => {
        const result: { success: true } | { success: false; msg: string } =
          res.data;
        if (result.success === true) {
          navigate('/');
          return;
        }
        if (result.success === false) {
          setOpenBackSpin(false);
          alert(`login failed, ${result.msg}`);
        }
      })
      .catch((err: ValidationFailedErr) => {
        alert(err.response.data.message.join(' '));
        setOpenBackSpin(false);
      });
  };

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
    axiosInstance
      .post('/auth/signin', signInForm)
      .then((res) => {
        const result: { success: true } | { success: false; msg: string } =
          res.data;
        if (result.success === true) {
          navigate('/');
          return;
        }
        if (result.success === false) {
          setOpenBackSpin(false);
          alert(`login failed, ${result.msg}`);
        }
      })
      .catch((err: ValidationFailedErr) => {
        alert(err.response.data.message.join(' '));
        setOpenBackSpin(false);
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
                placeholder='example@gmail.com'
                type='email'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{ m: 1, width: '30ch' }}
                id='standard-basic'
                label='password'
                variant='standard'
                onChange={onPasswordHandler}
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
      <hr></hr>
      <div>Sign in using test accounts</div>
      <Button
        variant='outlined'
        size='medium'
        sx={{ m: 1, width: '10ch' }}
        onClick={() => {
          tryTestAccount('1');
        }}
      >
        TEST 1
      </Button>
      <Button
        variant='outlined'
        size='medium'
        sx={{ m: 1, width: '10ch' }}
        onClick={() => {
          tryTestAccount('2');
        }}
      >
        TEST 2
      </Button>
      <Button
        variant='outlined'
        size='medium'
        sx={{ m: 1, width: '10ch' }}
        onClick={() => {
          tryTestAccount('3');
        }}
      >
        TEST 3
      </Button>
      <Button
        variant='outlined'
        size='medium'
        sx={{ m: 1, width: '10ch' }}
        onClick={() => {
          tryTestAccount('4');
        }}
      >
        TEST 4
      </Button>
      <Button
        variant='outlined'
        size='medium'
        sx={{ m: 1, width: '10ch' }}
        onClick={() => {
          tryTestAccount('5');
        }}
      >
        TEST 5
      </Button>
      <Button
        variant='outlined'
        size='medium'
        sx={{ m: 1, width: '10ch' }}
        onClick={() => {
          tryTestAccount('6');
        }}
      >
        TEST 6
      </Button>
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
