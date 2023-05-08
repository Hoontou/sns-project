import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authHoc } from '../../../common/auth.hoc';
import axios from 'axios';
import { requestUrl } from '../../../common/etc';
import sample from '../../../asset/sample1.jpg';
import { Button, TextField } from '@mui/material';
import './UserSetting.css';
import { resizer } from '../../../common/image.resizer';
import { AuthResultRes } from 'sns-interfaces';

const UserSetting = () => {
  const navigate = useNavigate();
  const { targetid: userId } = useParams();
  const [spin, setSpin] = useState<boolean>(true);
  const [img, setImg] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [intro, setIntro] = useState<string>('');
  const [selectedImgUrl, setSelectedImgUrl] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [showingImg, setShowingImg] = useState<string>('');

  const onUsernameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.currentTarget.value);
  };
  const onIntroHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setIntro(e.currentTarget.value);
  };

  const checkFileCount = (e: ChangeEvent<HTMLFormElement>) => {
    const input = e.target;
    const fileList: File[] = Object.values(e.target.files);

    if (fileList.length > 1) {
      //한개넘으면 초기화시킴.
      alert('사진은 한개만 선택해야 해요.');
      input.value = '';
      return;
    } else {
      setSelectedImgUrl(''); //이미 들어있는 사진을 초기화
      setFile(null);

      if (fileList[0] !== undefined) {
        setFile(fileList[0]);
        setSelectedImgUrl(URL.createObjectURL(fileList[0])); //이미지 붙여넣기
      }
      return;
    }
  };

  //upload로 요청보낸다.
  const onSubmitUserImg = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (file === null) {
      alert('업로드할 사진이 필요함');
      return;
    }

    //보내기전 리사이징, 인증
    const contents: File[] | false = await resizer([file]); //리사이저로 복사배열보내고 리사이징배열 받는다.
    if (contents === false) {
      //리사이징 실패시 샌딩파일리스트 비우고 리턴.
      setFile(null);
      alert('Err while image resizing');
      return;
    }
    const authRes: AuthResultRes = await authHoc();
    if (authRes.success === false) {
      //인증실패
      alert('Err while Authentication, need login');
      navigate('/signin');
      return;
    }

    //axios 보내기
    const formData = new FormData();
    //인풋에 많이 담아도 네개 까지만 컷한다.
    contents.map((i) => {
      return formData.append('file', i);
    });
    formData.append('userId', JSON.stringify({ userId: authRes.userId }));
    if (process.env.NODE_ENV === 'development') {
      await axios //업로드 서버로 보낸다.
        .post('/upload/uploaduserimgtoloacl', formData);
    } else {
      await axios //업로드 서버로 보낸다.
        .post('/upload/uploaduserimgtoazure', formData);
    }

    //이거 파일 보내는동안 페이지를 벗어나면 안되나? 알아봐야함.
    //벗어나도 되면 그냥 알람MSA에 Id 보내고 페이지 벗어나자.
    //then을 안받아도 되게 느슨한 연결로 만들어 보자.
    alert('file sending succeed');
    navigate('/myfeed');
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

  useEffect(() => {
    if (selectedImgUrl !== '') {
      setShowingImg(selectedImgUrl);
      return;
    }
    setShowingImg(img === '' ? sample : `${requestUrl}/${img}`);
    return;
  }, [img, selectedImgUrl]);

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
              src={showingImg}
              alt='profile'
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '70%',
                objectFit: 'cover',
              }}
            />
            <form
              onSubmit={onSubmitUserImg}
              encType='multipart/form-data'
              onChange={checkFileCount}
            >
              <label
                style={{ marginRight: '4rem' }}
                className='input-file-button'
                htmlFor='input-file'
              >
                사진 찾기
              </label>
              <input
                id='input-file'
                style={{ display: 'none' }}
                type='file'
                multiple={true}
                accept='.jpg, .png, .webp'
              />

              <Button variant='outlined' size='medium' type='submit'>
                Upload
              </Button>
            </form>
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
