import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authHoc } from '../../../common/auth.hoc';
import axios from 'axios';
import { requestUrl } from '../../../common/ect';
import sample from '../../../asset/sample1.jpg';
import { Button, TextField } from '@mui/material';
import './UserSetting.css';

const UserSetting = () => {
  const navigate = useNavigate();
  const { targetid: userId } = useParams();
  const [spin, setSpin] = useState<boolean>(true);
  const [img, setImg] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [intro, setIntro] = useState<string>('');

  const onUsernameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.currentTarget.value);
  };
  const onIntroHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setIntro(e.currentTarget.value);
  };

  const submitUsername = () => {
    setSpin(true);

    axios
      .post('/gateway/user/changeusername', { userId, username })
      .then((res) => {
        setSpin(false);
        const result: { success: boolean; exist?: boolean } = res.data;
        if (result.success === false) {
          console.log(result);
          alert(
            result.exist === true
              ? '이미 존재하는 이름이에요. 다른 이름으로 시도해주세요.'
              : '서버문제로 바꾸기 실패했어요. 나중에 다시 시도해주세요.'
          );
          return;
        }
        navigate('/myfeed');
        return;
      });
  };

  const submitIntro = () => {
    setSpin(true);
    const len = intro.split('\n').length;
    if (len > 3) {
      alert('소개글이 세줄이 넘어요.');
      setSpin(false);
      return;
    }
    if (intro.length - len * 2 > 50) {
      alert('소개글이 50글자가 넘어요');
      setSpin(false);
      return;
    }

    axios.post('/gateway/user/changeintro', { userId, intro }).then((res) => {
      setSpin(false);
      const { success } = res.data;
      if (success === false) {
        alert('서버문제로 바꾸기 실패했어요. 나중에 다시 시도해 주세요.');
        return;
      }
      navigate('/myfeed');
      return;
    });
  };

  useEffect(() => {
    authHoc()
      .then((authRes) => {
        if (authRes.success === false) {
          alert('Err while Authentication, need login');
          navigate('/signin');
          return;
        }
        setSpin(false);
        if (authRes.userId !== userId) {
          //쿠키로 인증한 아이디랑 url아이디랑 다르면 튕겨낸다.
          alert('invalid access');
          navigate('/myfeed');
          return;
        }
      })
      .then(() => {
        //유저인포.tsx에서 쓰던 axios 코드임.
        //유저 img, username, introduce 가져오기.
        axios.post('/gateway/userinfo', { userId }).then((res) => {
          const data:
            | {
                success: true;
                username: string;
                img: string;
                introduce: string;
              }
            | { success: false } = res.data;

          if (data.success === false) {
            //불러오기 실패했으면 다른곳으로 이동시킴.
            navigate('/');
            return;
          }
          setIntro(data.introduce);
          setUsername(data.username);
          setImg(data.img);

          setSpin(false);
        });
      });
  }, [navigate, userId]);

  return (
    <>
      {spin && 'waiting...'}
      {!spin && (
        <div
          className='text-center'
          style={{
            width: '90%',
            margin: '0.7rem auto',
            paddingBottom: '3.5rem',
          }}
        >
          <div>
            <img
              src={img === '' ? sample : `${requestUrl}/${img}`}
              alt='profile'
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '70%',
                objectFit: 'cover',
              }}
            />
          </div>
          <div>
            <TextField
              sx={{ m: 1, width: '30ch' }}
              label='Username'
              variant='standard'
              onChange={onUsernameHandler}
              value={username}
            />{' '}
            <p>이름. 영어만, 4~10자 입력가능</p>
            <div>
              <Button
                variant='outlined'
                size='medium'
                onClick={() => {
                  setUsername('');
                }}
              >
                칸비우기
              </Button>
              <Button variant='outlined' size='medium' onClick={submitUsername}>
                수정하기
              </Button>
            </div>
          </div>
          <TextField
            sx={{ m: 1, width: '30ch' }}
            label='Introduce'
            variant='standard'
            multiline
            rows={4}
            onChange={onIntroHandler}
            value={intro}
          />{' '}
          <div>
            <p>소개글. 최대 50자, 3줄까지 입력가능</p>
            <div>
              <Button
                variant='outlined'
                size='medium'
                onClick={() => {
                  setIntro('');
                }}
              >
                칸비우기
              </Button>
              <Button variant='outlined' size='medium' onClick={submitIntro}>
                수정하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSetting;
