import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authHoc } from '../../../common/auth.hoc';
import axios from 'axios';
import { requestUrl } from '../../../common/ect';
import sample from '../../../asset/sample1.jpg';
import { TextField } from '@mui/material';

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

  //다른곳에서는 실패하면 /signin으로 이동하게.
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
          //쿠키로 인증한아이디랑 url아이디랑 다르면 튕겨낸다.
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
            이름. 영어만, 4~10자 입력가능
            <TextField
              sx={{ m: 1, width: '30ch' }}
              label='Username'
              variant='standard'
              onChange={onUsernameHandler}
              value={username}
            />
          </div>
          <div>
            소개글. 최대 70자, 4줄까지 입력가능
            <TextField
              sx={{ m: 1, width: '30ch' }}
              label='Introduce'
              variant='standard'
              multiline
              rows={4}
              onChange={onIntroHandler}
              value={intro}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default UserSetting;
