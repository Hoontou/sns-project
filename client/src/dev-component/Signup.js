import { useState } from 'react';
import axios from 'axios';
const Signin = () => {
  const [email, setEmail] = useState('hoontou@gmail.com');
  const [password, setPassword] = useState('test');
  const [username, setUsername] = useState('hoontou');

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
        <input
          onChange={onEmailHandler}
          type='email'
          defaultValue={'hoontou@gmail.com'}
        />
        <label>비밀번호</label>
        <input onChange={onPasswordHandler} defaultValue={'test'} />
        <label>username</label>
        <input onChange={onUsernameHandler} defaultValue={'hoontou'} />

        <button type='submit'>회원가입</button>
      </form>
    </div>
  );
};

export default Signin;
