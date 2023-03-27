import axios from 'axios';
import { ChangeEvent, useEffect, useState } from 'react';
import { ObjectId } from '../../../common/genobjectid';
import './Upload.css';
import Slider from '../../common/Slider';
import Navbar from '../../common/Navbar/Navbar';
import { Button } from '@mui/material';
import { authHoc } from '../../../common/auth.hoc';
import { useNavigate } from 'react-router-dom';
import { resizer } from '../../../common/image.resizer';

const Upload = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [sendingFileList, setFileList] = useState<File[]>([]);

  const onTitleHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.currentTarget.value);
  };

  //인풋에 4개이상이면 리셋, 선택한이미지 볼수있게 image리스트에 푸시
  const checkFileCount = (e: ChangeEvent<HTMLFormElement>) => {
    const input = e.target;
    const fileList = e.target.files;
    if (fileList.length > 4) {
      alert('최대 4개까지만 올릴 수 있음');
      input.value = '';
    } else {
      setImages([]); //이미 들어있는 url 초기화
      setFileList([]);
      const list = [];
      for (let i = 0; i < fileList.length; i += 1) {
        const url = URL.createObjectURL(fileList[i]);
        list.push(url); //url 파싱해서 리스트에 넣고
      }
      setFileList(fileList);
      setImages(list); //이미지 리스트에 붙여넣기
    }
  };

  //upload로 요청보낸다.
  const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sendingFileList.length === 0 || title === '') {
      alert('업로드할 내용이 필요함');
      return;
    }
    // const contents = sendingFileList; //인풋에서 가져와서
    const contents: File[] | false = await resizer([...sendingFileList]); //리사이저로 복사배열보내고 리사이징배열 받는다.
    const userId: string | false = await axios
      .get('/main-back/user/hoc')
      .then((res) => {
        return res.data.userId;
      })
      .catch(() => {
        alert('인증 에러');
        return false;
      }); //나중에 클라이언트 구현시 HOC 실패 방어코드 짜야함.
    //console.log(userId);
    if (contents === false || userId === false) {
      //리사이징or인증 실패시 샌딩파일리스트 비우고 리턴.
      setFileList([]);
      return;
    } //인증에러나면 걍 로그인페이지로 보내버려도 괜찮을듯.
    //지금은 걍 해당페이지에 머무르게 하고 있으니까.

    const formData = new FormData();
    const alert_id = ObjectId(); //게시물 업로드중 알람을 위한 Id
    //인풋에 많이 담아도 네개 까지만 컷한다.
    for (let i = 0; i < 4; i++) {
      formData.append('file', contents[i]);
    }
    //게시글 코멘트와 알람 Id를 담는다.
    formData.append('title', JSON.stringify({ title }));
    formData.append('alert_id', JSON.stringify({ alert_id }));
    formData.append('userId', JSON.stringify({ userId }));
    axios //업로드 서버로 보낸다.
      .post('/upload/uploadfiles', formData);
    //이거 파일 보내는동안 페이지를 벗어나면 안되나? 알아봐야함.
    //벗어나도 되면 그냥 알람MSA에 Id 보내고 페이지 벗어나자.
    //then을 안받아도 되게 느슨한 연결로 만들어 보자.
  };

  useEffect(() => {
    //다른곳에서는 실패하면 /signin으로 이동하게.
    authHoc()
      .then()
      .catch(() => {
        alert('need login');
        navigate('/signin');
      });
  }, [navigate]);

  return (
    <div
      className='container text-center'
      style={{ width: '95%', margin: '1.5rem auto' }}
    >
      <h2>4개보다 많이올려도 네개만 올라감., jpg, mp4, png만 가능</h2>
      <h2>가로3:세로4 비율로 보임. 나중에 반응형 으로 수정해야할듯?</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>타이틀</label>
        <input onChange={onTitleHandler} placeholder='우리집 고양이 귀엽죠' />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <Slider images={images} />
      </div>
      <form
        onSubmit={onSubmit}
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
          accept='.mp4, .jpg, .png'
        />

        <Button variant='outlined' size='medium' type='submit'>
          Upload
        </Button>
      </form>
      <Navbar value={3} />
    </div>
  );
};

export default Upload;
