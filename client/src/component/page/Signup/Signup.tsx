import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { SignUpDto } from 'sns-interfaces';
import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  TextField,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { authHoc } from '../../../common/auth.hoc';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../App';

export interface ValidationFailedErr {
  response: {
    data: {
      error: string;
      message: string[];
      statusCode: number;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [openBackSpin, setOpenBackSpin] = useState<boolean>(false);

  const registerTestAccounts = () => {
    const tmp = Array.from({ length: 6 }, (_, index) => (index + 1).toString());
    tmp.forEach((i) => {
      axiosInstance.post('/auth/signup', {
        email: 'test' + i + '@gmail.com',
        username: 'test' + i,
        password: 'test',
      });
    });
  };

  const onEmailHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value);
  };
  const onPasswordHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
  };
  const onUsernameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.currentTarget.value);
  };

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (username === '테스트계정등록') {
      registerTestAccounts();
      return;
    }

    setOpenBackSpin(true);
    const signUpForm: SignUpDto = {
      email,
      password,
      username,
    }; //나중에 main-back의 DTO에 부합하지 않으면 모달로 오류뱉어야함

    axiosInstance
      .post('/auth/signup', signUpForm)
      .then((res) => {
        if (res.data.success === true) {
          alert('계정 등록 성공');
          setOpenBackSpin(false);
          navigate('/signin');
          return;
        }
        if (res.data.success === false) {
          alert(`${res.data.msg}, signup failed`);
          setOpenBackSpin(false);
        }
        return;
      })
      .catch((err: ValidationFailedErr) => {
        alert(err.response.data.message.join(' '));
        setOpenBackSpin(false);
      });
  };
  useEffect(() => {
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
      <div>계정 등록</div>
      username은 영어 소문자와 숫자만 가능해요.
      <div>실제 계정을 입력하지 마세요.</div>
      <hr></hr>
      <form onSubmit={onSubmitHandler}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              sx={{ m: 1, width: '30ch' }}
              id='standard-basic'
              label='Username, 3~10 word'
              variant='standard'
              onChange={onUsernameHandler}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              sx={{ m: 1, width: '30ch' }}
              id='standard-basic'
              label='Email'
              variant='standard'
              onChange={onEmailHandler}
              type='email'
              placeholder='example@gmail.com'
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              sx={{ m: 1, width: '30ch' }}
              id='standard-basic'
              label='Password, 4~20 word'
              variant='standard'
              onChange={onPasswordHandler}
              type='password'
            />
          </Grid>
        </Grid>
        <div style={{ marginTop: '0.5rem' }}>
          <Button
            sx={{ m: 1, width: '14ch' }}
            variant='outlined'
            size='medium'
            type='submit'
          >
            Sign Up
          </Button>
        </div>
        <Link
          style={{ textDecoration: 'none', fontSize: '0.8rem' }}
          to='/signin'
        >
          or Sign In
        </Link>
      </form>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackSpin}
      >
        <div>계정 등록중....&nbsp;&nbsp;&nbsp;</div>
        <CircularProgress color='inherit' />
      </Backdrop>
    </div>
  );
};

export default Signup;
