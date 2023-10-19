import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import axios from 'axios';
import { SignUpDto } from 'sns-interfaces';
import { Button, Grid, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { authHoc } from '../../../common/auth.hoc';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('hoontou@gmail.com');
  const [password, setPassword] = useState('test');
  const [username, setUsername] = useState('hoontou');

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
    const signUpForm: SignUpDto = {
      email,
      password,
      username,
    }; //나중에 main-back의 DTO에 부합하지 않으면 모달로 오류뱉어야함
    //유저네임 4~10개
    //비번은 영어랑숫자만 4~20개 (현재는,)
    axios.post('/gateway/auth/signup', signUpForm).then((res) => {
      if (res.data.success === true) {
        alert('signup succeed');
        navigate('/signin');
      }
      if (res.data.success === false) {
        alert(`${res.data.msg}, signup failed`);
      }
    });
  };
  useEffect(() => {
    authHoc().then((authRes) => {
      if (authRes.success === true) {
        navigate('/');
      }
    });
  }, [navigate]);

  return (
    <div
      className='container text-center'
      style={{ width: '90%', margin: '1.5rem auto' }}
    >
      this is signup, 비번 영어숫자만, 이름 영어만
      <form onSubmit={onSubmitHandler}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              sx={{ m: 1, width: '30ch' }}
              id='standard-basic'
              label='Username'
              variant='standard'
              onChange={onUsernameHandler}
              defaultValue={'hoontou'}
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
              defaultValue={'hoontou@gmail.com'}
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
              defaultValue={'test'}
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
    </div>
  );
};

export default Signup;
