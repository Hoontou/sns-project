import { ChangeEvent, FormEvent, useState } from 'react';
import axios from 'axios';
import { SignUpDto } from 'sns-interfaces';

const Signup = () => {
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
    axios.post('/main-back/user/signup', signUpForm).then((res) => {
      alert(res.data.success);
      if (res.data.success === false) {
        alert(res.data.msg);
      }
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

export default Signup;
