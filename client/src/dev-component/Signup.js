import { useState } from 'react';
import axios from 'axios';
const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const onEmailHandler = (e) => {
    setEmail(e.currentTarget.value);
  };
  const onPasswordHandler = (e) => {
    setPassword(e.currentTarget.value);
  };
  const onUsernameHandler = (e) => {
    setUsername(e.currentTarget.value);
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();
    const signUpForm = {
      email,
      password,
      username,
    };
    axios.post('/main-back/user/signup', signUpForm).then((res) => {
      alert(res.data.success);
    });
  };
  return (
    <div>
      this is signup, 비번 영어숫자만, 이름 영어만
      <form onSubmit={onSubmitHandler}>
        <label>이메일</label>
        <input onChange={onEmailHandler} type='email' />
        <label>비밀번호</label>
        <input onChange={onPasswordHandler} />
        <label>username</label>
        <input onChange={onUsernameHandler} />

        <button type='submit'>회원가입</button>
      </form>
    </div>
  );
};

export default Signin;
