import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import './UserSetting.css';
import ChangeImg from './ChangeImg';
import Navbar from '../../common/Navbar/Navbar';
import { UserInfo } from 'sns-interfaces/client.interface';
import { ReqUser } from 'sns-interfaces';
import { axiosInstance } from '../../../App';

const UserSetting = () => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [img, setImg] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [intro, setIntro] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [introduceName, setIntroduceName] = useState<string>('');
  const onUsernameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.currentTarget.value);
  };
  const onIntroHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setIntro(e.currentTarget.value);
  };
  const onIntroduceNameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setIntroduceName(e.currentTarget.value);
  };

  /**username수정요청 보내는 */
  const submitUsername = () => {
    setSpin(true);

    axiosInstance
      .post('/user/changeusername', { userId, username })
      .then((res) => {
        setSpin(false);
        const result: { success: boolean; exist?: boolean } = res.data;
        if (result.success === false) {
          alert(
            result.exist === true
              ? '이미 존재하는 이름이에요. 다른 이름으로 시도해주세요.'
              : '서버문제로 바꾸기 실패했어요. 나중에 다시 시도해주세요.'
          );
          return;
        }
        navigate('/feed');
        return;
      });
  };

  /**introduceName수정요청 보내는 */
  const submitIntroduceName = () => {
    setSpin(true);

    axiosInstance
      .post('/user/changeintroducename', { userId, introduceName })
      .then((res) => {
        setSpin(false);
        const result: { success: boolean; exist?: boolean } = res.data;
        if (result.success === false) {
          alert('서버문제로 바꾸기 실패했어요. 나중에 다시 시도해주세요.');
          navigate('/feed');
          return;
        }
        navigate('/feed');
        return;
      });
  };

  /**introduce 수정 요청 보내는 */
  const submitIntro = () => {
    setSpin(true);
    //소개글 양식체크
    const len = intro.split('\n').length;
    if (len > 3) {
      alert('소개글이 세줄이 넘어요.');
      setSpin(false);
      return;
    }
    if (intro.length - len * 2 > 50) {
      //안정확함.
      alert('소개글이 50글자가 넘어요');
      setSpin(false);
      return;
    }

    axiosInstance.post('/user/changeintro', { userId, intro }).then((res) => {
      setSpin(false);
      const { success } = res.data;
      if (success === false) {
        alert('서버문제로 바꾸기 실패했어요. 나중에 다시 시도해 주세요.');
        navigate('/feed');

        return;
      }
      navigate('/feed');
      return;
    });
  };

  useEffect(() => {
    axiosInstance.post('/userinfo').then((res) => {
      const data:
        | {
            userinfo: UserInfo;
            type: 'otherInfo' | 'myInfo';
            reqUser: ReqUser;
            success: true;
          }
        | { success: false } = res.data;

      //username 찾기실패
      if (data.success === false) {
        alert('not found user');
        navigate('/');
        return;
      }

      if (data.reqUser.success === false) {
        alert('auth failed.');
        navigate('/signin');
        return;
      }

      //이제 가져온 데이터 state에 채워넣기 시작
      setImg(data.userinfo.img);
      setIntro(data.userinfo.introduce);
      setUsername(data.userinfo.username);
      setUserId(data.reqUser.userId);
      setIntroduceName(data.userinfo.introduceName);
      setSpin(false);
    });
  }, []);

  return (
    <>
      {spin && 'waiting...'}
      {!spin && (
        <div
          className='text-center'
          style={{
            width: '90%',
            margin: '0.7rem auto',
            paddingTop: '3rem',
            paddingBottom: '3.5rem',
          }}
        >
          <ChangeImg img={img} />
          <hr></hr>
          <div>
            <p>계정 이름. 영어만, 4~10자 입력가능</p>

            <TextField
              sx={{ m: 1, width: '30ch' }}
              label='Username'
              variant='standard'
              onChange={onUsernameHandler}
              value={username}
            />
            <div>
              <Button
                variant='outlined'
                size='medium'
                onClick={() => {
                  setUsername('');
                }}
                style={{ marginRight: '3rem' }}
              >
                칸비우기
              </Button>
              <Button variant='outlined' size='medium' onClick={submitUsername}>
                수정하기
              </Button>
            </div>
          </div>
          <hr></hr>

          <div>
            <p>소개 이름. 4~10자 입력가능</p>

            <TextField
              sx={{ m: 1, width: '30ch' }}
              label='Name'
              variant='standard'
              onChange={onIntroduceNameHandler}
              value={introduceName}
            />
            <div>
              <Button
                variant='outlined'
                size='medium'
                onClick={() => {
                  setIntroduceName('');
                }}
                style={{ marginRight: '3rem' }}
              >
                칸비우기
              </Button>
              <Button
                variant='outlined'
                size='medium'
                onClick={submitIntroduceName}
              >
                수정하기
              </Button>
            </div>
          </div>
          <hr></hr>

          <div>
            <p>소개글. 3줄까지 입력가능</p>

            <TextField
              sx={{ m: 1, width: '90%', maxWidth: '600px' }}
              color={intro.length > 50 ? 'warning' : 'primary'}
              label={`Introduce ${intro.length}/50`}
              variant='standard'
              multiline
              rows={4}
              onChange={onIntroHandler}
              value={intro}
            />
            <div>
              <Button
                variant='outlined'
                size='medium'
                onClick={() => {
                  setIntro('');
                }}
                style={{ marginRight: '3rem' }}
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
      <Navbar value={4} />
    </>
  );
};

export default UserSetting;
