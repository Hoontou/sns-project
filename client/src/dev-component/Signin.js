import { useState } from 'react';
import axios from 'axios';

const Signin = () => {
  const [email, setEmail] = useState('hoontou@gmail.com');
  const [password, setPassword] = useState('test');

  const onEmailHandler = (e) => {
    setEmail(e.currentTarget.value);
  };
  const onPasswordHandler = (e) => {
    setPassword(e.currentTarget.value);
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();
    const signInForm = {
      email,
      password,
    };
    axios.post('/main-back/user/signin', signInForm).then((res) => {
      alert(res.data.success);
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
