import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { SignInDto, AuthResultRes } from 'sns-interfaces';
import { Link, useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { authHoc } from '../../../common/auth.hoc';
import Navbar from '../../common/Navbar/Navbar';

const Signin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('hoontou@gmail.com');
  const [password, setPassword] = useState('test');

  const onEmailHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value);
  };
  const onPasswordHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
  };

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const signInForm: SignInDto = {
      email,
      password,
    };
    axios.post('/main-back/user/signin', signInForm).then((res) => {
      const result: AuthResultRes = res.data;
      if (result.success === true) {
        alert('login succeed');
        //AuthSuccess
        // localStorage.setItem('userId', result.userId); //AES로 암호화 된 id 원래(int)
        // localStorage.setItem('username', res.data.username);
        navigate('/');
      }
      if (result.success === false) {
        alert('login failed');
      }
    });
  };

  useEffect(() => {
    //다른곳에서는 실패하면 /signin으로 이동하게.
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
      this is signin
      <div>
        <form onSubmit={onSubmitHandler}>
          <TextField
            id='standard-basic'
            label='Email'
            variant='standard'
            onChange={onEmailHandler}
            type='email'
            defaultValue={'hoontou@gmail.com'}
          />
          <TextField
            id='standard-basic'
            label='password'
            variant='standard'
            onChange={onPasswordHandler}
            defaultValue={'test'}
            type='password'
          />
          <div style={{ marginTop: '0.5rem' }}>
            <Button variant='outlined' size='medium' type='submit'>
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
      <Navbar value={1} />
    </div>
  );
};

export default Signin;
