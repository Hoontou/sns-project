import { ChangeEvent, FormEvent, useState } from 'react';
import axios from 'axios';
import { SignInDto } from 'sns-interfaces';

const Signin = () => {
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
      alert(res.data.success);
      localStorage.setItem('userId', res.data.userId); //AES로 암호화 된 id(int)
      localStorage.setItem('username', res.data.username);
    });
  };
  return (
    <div>
      this is signin
      <form onSubmit={onSubmitHandler}>
        <label>이메일</label>
        <input
          onChange={onEmailHandler}
          type='email'
          defaultValue={'hoontou@gmail.com'}
        />
        <label>비밀번호</label>
        <input onChange={onPasswordHandler} defaultValue={'test'} />

        <button type='submit'>로그인</button>
      </form>
    </div>
  );
};

export default Signin;
