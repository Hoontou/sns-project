import { Button } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthResultRes } from 'sns-interfaces';
import { authHoc } from '../../../common/auth.hoc';
import { resizer } from '../../../common/image.resizer';
import { requestUrl } from '../../../common/etc';
import sample from '../../../asset/sample1.jpg';
import { axiosUploadInstance } from '../../../App';

const ChangeImg = (props: { img: string }) => {
  const navigate = useNavigate();

  const [selectedImgUrl, setSelectedImgUrl] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [showingImg, setShowingImg] = useState<string>('');

  /**사진 한개만 선택했는지 체크하는 */
  const checkFileCount = (e: ChangeEvent<HTMLFormElement>) => {
    const input = e.target;
    const fileList: File[] = Object.values(e.target.files);

    if (fileList.length > 1) {
      //한개넘으면 초기화시킴.
      alert('사진은 한개만 선택해야 해요.');
      input.value = '';
      setSelectedImgUrl(''); //이미 들어있는 사진을 초기화
      setFile(null);

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

  /**upload로 요청 보낸다. upload.tsx에서 가져온 함수 */
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

    //axiosInstance 보내기
    const formData = new FormData();
    //인풋에 많이 담아도 네개 까지만 컷한다.
    contents.map((i) => {
      return formData.append('file', i);
    });
    formData.append('userId', JSON.stringify({ userId: authRes.userId }));
    if (process.env.NODE_ENV) {
      await axiosUploadInstance //업로드 서버로 보낸다.
        .post('/uploaduserimgtoloacl', formData);
    } else {
      await axiosUploadInstance //업로드 서버로 보낸다.
        .post('/uploaduserimgtoazure', formData);
    }

    //이거 파일 보내는동안 페이지를 벗어나면 안되나? 알아봐야함.
    //벗어나도 되면 그냥 알람MSA에 Id 보내고 페이지 벗어나자.
    //then을 안받아도 되게 느슨한 연결로 만들어 보자.
    alert('file sending succeed');
    navigate('/feed');
  };

  useEffect(() => {
    //props.img선택했으면 보여줄 이미지 state 업데이트 해주는
    if (selectedImgUrl !== '') {
      setShowingImg(selectedImgUrl);
      return;
    }
    setShowingImg(props.img === '' ? sample : `${requestUrl}/${props.img}`);
    return;
  }, [props.img, selectedImgUrl]);

  return (
    <>
      <div>
        <p>프로필 사진. 한장만 선택가능</p>

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
          style={{ marginTop: '0.5rem' }}
        >
          <label
            style={{ marginRight: '3rem' }}
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
    </>
  );
};
export default ChangeImg;
