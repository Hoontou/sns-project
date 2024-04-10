import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Backdrop, Button, CircularProgress, TextField } from '@mui/material';
import './UserSetting.css';
import ChangeImg from './ChangeImg';
import Navbar from '../../common/Navbar/Navbar';
import { UserInfo } from 'sns-interfaces/client.interface';
import { axiosInstance } from '../../../App';
import { ValidationFailedErr } from '../Signup/Signup';

const UserSetting = () => {
  const navigate = useNavigate();
  const [isFulfilled, setIsFulfilled] = useState<boolean>(true);
  const [img, setImg] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [intro, setIntro] = useState<string>('');
  const [introduceName, setIntroduceName] = useState<string>('');
  const [initialInfo, setInitialInfo] = useState<{
    username: string;
    intro: string;
    introduceName: string;
  }>({ username: '', intro: '', introduceName: '' });
  const [userId, setUserId] = useState<string>('');
  const [openBackSpin, setOpenBackSpin] = useState<boolean>(false);

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
    if (username === initialInfo?.username) {
      alert('수정할게 없어요.');
      return;
    }

    setOpenBackSpin(true);

    axiosInstance
      .post('/user/changeusername', { userId, username })
      .then((res) => {
        setOpenBackSpin(false);
        const result: { success: boolean; exist?: boolean } = res.data;
        if (result.success === false) {
          alert(
            result.exist === true
              ? '이미 존재하는 이름이에요. 다른 이름으로 시도해주세요.'
              : '서버문제로 바꾸기 실패했어요. 나중에 다시 시도해주세요.'
          );
          return;
        }

        setInitialInfo({ ...initialInfo, username });
        alert('수정 완료');
        return;
      })
      .catch((err: ValidationFailedErr) => {
        alert(err.response.data.message.join(' '));
        setOpenBackSpin(false);

        return;
      });
  };

  /**introduceName수정요청 보내는 */
  const submitIntroduceName = () => {
    if (introduceName === initialInfo?.introduceName) {
      alert('수정할게 없어요.');
      return;
    }

    setOpenBackSpin(true);

    axiosInstance
      .post('/user/changeintroducename', { userId, introduceName })
      .then((res) => {
        setOpenBackSpin(false);
        const result: { success: boolean; exist?: boolean } = res.data;
        if (result.success === false) {
          alert('서버문제로 바꾸기 실패했어요. 나중에 다시 시도해주세요.');
          navigate('/feed');
          return;
        }
        setInitialInfo({ ...initialInfo, introduceName });
        alert('수정 완료');
        return;
      })
      .catch((err: ValidationFailedErr) => {
        alert(err.response.data.message.join(' '));
        setOpenBackSpin(false);
        return;
      });
  };

  /**introduce 수정 요청 보내는 */
  const submitIntro = () => {
    if (intro === initialInfo?.intro) {
      alert('수정할게 없어요.');
      return;
    }

    setOpenBackSpin(true);
    //소개글 양식체크
    const len = intro.split('\n').length;
    if (len > 3) {
      alert('소개글이 세줄이 넘어요.');
      setOpenBackSpin(false);
      return;
    }
    if (intro.length - len * 2 > 50) {
      //안정확함.
      alert('소개글이 50글자가 넘어요');
      setOpenBackSpin(false);
      return;
    }

    axiosInstance.post('/user/changeintro', { userId, intro }).then((res) => {
      setOpenBackSpin(false);
      const { success } = res.data;
      if (success === false) {
        alert('서버문제로 바꾸기 실패했어요. 나중에 다시 시도해 주세요.');
        navigate('/feed');

        return;
      }
      alert('수정 완료');
      setInitialInfo({ ...initialInfo, intro });

      return;
    });
  };

  useEffect(() => {
    axiosInstance.post('/userinfo').then((res) => {
      const data:
        | {
            userinfo: UserInfo;
            type: 'otherInfo' | 'myInfo';
            reqUserId: string;
            success: true;
          }
        | { success: false } = res.data;

      //username 찾기실패
      if (data.success === false) {
        alert('access denied');
        navigate('/');
        return;
      }

      //이제 가져온 데이터 state에 채워넣기 시작
      setImg(data.userinfo.img);
      setIntro(data.userinfo.introduce);
      setUsername(data.userinfo.username);
      setUserId(data.reqUserId);
      setIntroduceName(data.userinfo.introduceName);
      setIsFulfilled(false);
      setInitialInfo({
        username,
        intro,
        introduceName,
      });
    });
  }, []);

  return (
    <>
      {isFulfilled && 'waiting...'}
      {!isFulfilled && (
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
            <p>계정 이름. 영어랑 숫자만, 3~10자 입력가능</p>

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
            <p>소개 이름. 특수문자 불가능, 최대 10자 입력가능</p>

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

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackSpin}
      >
        <div>수정 요청중....&nbsp;&nbsp;&nbsp;</div>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Navbar value={4} />
    </>
  );
};

export default UserSetting;
