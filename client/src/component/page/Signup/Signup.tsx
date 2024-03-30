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

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('hoontou@gmail.com');
  const [password, setPassword] = useState('test');
  const [username, setUsername] = useState('hoontou');
  const [openBackSpin, setOpenBackSpin] = useState<boolean>(false);

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
    setOpenBackSpin(true);
    const signUpForm: SignUpDto = {
      email,
      password,
      username,
    }; //나중에 main-back의 DTO에 부합하지 않으면 모달로 오류뱉어야함
    //유저네임 4~10개
    //비번은 영어랑숫자만 4~20개 (현재는,)
    axiosInstance.post('/auth/signup', signUpForm).then((res) => {
      if (res.data.success === true) {
        setOpenBackSpin(false);
        alert('계정 등록 성공');
        navigate('/signin');
        return;
      }
      if (res.data.success === false) {
        setOpenBackSpin(false);
        alert(`${res.data.msg}, signup failed`);
      }
      return;
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
      username은 영어만, 비밀번호는 영어와 숫자만 가능.
      <div>실제 계정을 입력하지 마세요.</div>
      <hr></hr>
      <form onSubmit={onSubmitHandler}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              sx={{ m: 1, width: '30ch' }}
              id='standard-basic'
              label='Username'
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
              label='Password'
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
        <div>로그인 중....&nbsp;&nbsp;&nbsp;</div>
        <CircularProgress color='inherit' />
      </Backdrop>
    </div>
  );
};

export default Signup;
