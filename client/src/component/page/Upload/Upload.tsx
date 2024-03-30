import { ChangeEvent, useEffect, useState } from 'react';
import { genObjectId } from '../../../common/genobjectid';
import './Upload.css';
import Slider from '../../common/Slider';
import Navbar from '../../common/Navbar/Navbar';
import { Backdrop, Button, CircularProgress } from '@mui/material';
import { authHoc } from '../../../common/auth.hoc';
import { useNavigate } from 'react-router-dom';
import { resizer } from '../../../common/image.resizer';
import { AuthResultRes } from 'sns-interfaces';
import TitleInput from './TitleInput';
import { Socket, io } from 'socket.io-client';
import SearchResultModal from '../../common/SearchResultModal';
import { axiosInstance } from '../../../App';
import axios from 'axios';

export const titleLen = 80;

/**검색결과로 가져오는 정보*/
export type SearchResult = SearchedUser | SearchedHashtag;
export interface SearchedUser {
  type: 'user';
  resultList: {
    username: string;
    img: string;
    introduceName: string;
    introduce: string;
  }[];
}
export interface SearchedHashtag {
  type: 'hashtag';
  resultList: {
    tagName: string;
    count: number;
  }[];
}

const Upload = () => {
  const navigate = useNavigate();
  const [openBackSpin, setOpenBackSpin] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [sendingFileList, setFileList] = useState<File[]>([]);
  const [searchSocket, setSearchSocket] = useState<Socket | undefined>(
    undefined
  );
  const [searchRequestString, setSearchRequestString] = useState<string | ''>(
    ''
  );
  const [searchResult, setSearchResult] = useState<SearchResult | undefined>(
    undefined
  );

  //검색결과창 컨트롤
  const [searchBarSpin, setSearchBarSpin] = useState<boolean>(false);
  const [searchBarDisplay, setSearchbarDisplay] = useState<boolean>(false);
  const [clickedTag, setClickedTag] = useState<string>('');
  //연속입력에 대한 검색딜레이 설정
  let timeoutId: NodeJS.Timeout | null = null;
  const delay = 700; //ms기준임

  //소켓연결 함수, 자식인 titleInput에서 실행함
  const connectSocket = () => {
    if (searchSocket === undefined) {
      const socket = io('http://localhost:4000/search');
      socket.on('searchUserOrHashtagResult', (data: SearchResult) => {
        setSearchResult(data);
        //데이터 가져왔으면 스핀멈춘다
        setSearchBarSpin(false);
      });
      setSearchSocket(socket);
    }
  };

  //인풋에 4개이상이면 리셋, 선택한이미지 볼수있게 image리스트에 푸시
  const checkFileCount = (e: ChangeEvent<HTMLFormElement>) => {
    const input = e.target;
    const fileList: File[] = Object.values(e.target.files);
    if (fileList.length > 4) {
      //네개넘으면 초기화시킴.
      alert('최대 4개까지만 올릴 수 있음');
      input.value = '';
      return;
    } else {
      setImages([]); //이미 들어있는 url 초기화
      setFileList([]);

      const list = fileList.map((i) => {
        return URL.createObjectURL(i);
      });
      setFileList(fileList);
      setImages(list); //이미지 리스트에 붙여넣기
      return;
    }
  };

  //upload로 요청보낸다.
  const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (title.length > titleLen) {
      alert(`글은 ${titleLen}자 이내로 써주세요`);
      return;
    }

    if (sendingFileList.length === 0) {
      alert('업로드할 사진이 필요함');
      return;
    }

    setOpenBackSpin(true);

    //보내기전 리사이징, 인증
    const contents: File[] | false = await resizer([...sendingFileList]); //리사이저로 복사배열보내고 리사이징배열 받는다.
    if (contents === false) {
      //리사이징 실패시 샌딩파일리스트 비우고 리턴.
      setFileList([]);
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
    //게시글 코멘트와 알람 Id를 담는다.
    formData.append('title', JSON.stringify({ title }));
    formData.append('alert_id', JSON.stringify({ alert_id: genObjectId() })); //게시물 업로드중 알람을 위한 Id
    formData.append('userId', JSON.stringify({ userId: authRes.userId }));
    if (process.env.NODE_ENV) {
      await axios //업로드 서버로 보낸다.
        .post('/upload/uploadtolocal', formData);
    } else {
      await axios //업로드 서버로 보낸다.
        .post('http://localhost:4001/uploadtoazure', formData);
    }

    //이거 파일 보내는동안 페이지를 벗어나면 안되나? 알아봐야함.
    //벗어나도 되면 그냥 알람MSA에 Id 보내고 페이지 벗어나자.
    //then을 안받아도 되게 느슨한 연결로 만들어 보자.
    alert('사진을 서버로 보냈어요. 업로드 하는 데 시간이 걸릴 수 있어요.');
    navigate(`/feed`);
  };

  //뒤로가기로 검색모달 끄는 useEffect
  useEffect(() => {
    // authHoc().then((authRes) => {
    //   if (authRes.success === false) {
    //     alert('Err while Authentication, need login');
    //     navigate('/signin');
    //     return;
    //   }
    // });

    //뒤로가기버튼 시 모달끄기, 모달창 안에 histroy.pushState 해놔야함.
    const handleBack = (event: PopStateEvent) => {
      setSearchbarDisplay(false);
    };

    //뒤로가기 event리스너 등록
    window.addEventListener('popstate', handleBack);

    return () => {
      //이게 꼭 있어야한단다. 창 나갈때 반환인가?
      window.removeEventListener('popstate', handleBack);
    };
  }, []);

  //웹소켓에 검색날리는 effect, 연속입력 대비해서  타임아웃 걸었음
  useEffect(() => {
    if (searchRequestString.length < 3 || searchRequestString.at(1) === ' ') {
      setSearchbarDisplay(false);
      return;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      console.log('send search string :', searchRequestString);
      //창띄우고 스핀돌리고, 데이터 받아왔으면 스핀멈추고(이건 socket.on에서 수행)
      if (searchBarDisplay === false) {
        setSearchbarDisplay(true);
      }
      setSearchBarSpin(true);
      searchSocket?.emit('searchUserOrHashtag', {
        searchString: searchRequestString,
      });
    }, delay);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchRequestString]);

  /**타이틀에 태그만 있을 시 안꺼지는거 fix위해 필요 */
  useEffect(() => {
    if (title === '@' || title === '#' || title === '') {
      setSearchbarDisplay(false);
    }
  }, [title]);

  return (
    <div
      className='container text-center'
      style={{ width: '95%', margin: '1rem auto', paddingBottom: '3.5rem' }}
    >
      <h6>사진을 4개 올릴 수 있어요.</h6>
      <hr></hr>
      <div>
        <Slider images={images} />
      </div>
      <TitleInput
        setTitle={setTitle}
        title={title}
        setSearchRequestString={setSearchRequestString}
        connectSocket={connectSocket}
        clickedTag={clickedTag}
        setSearchbarDisplay={setSearchbarDisplay}
      />

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
          accept='.jpg, .png, .webp'
        />

        <Button variant='outlined' size='medium' type='submit'>
          Upload
        </Button>
      </form>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackSpin}
      >
        <div>사진을 처리중....&nbsp;&nbsp;&nbsp;</div>
        <CircularProgress color='inherit' />
      </Backdrop>

      {searchBarDisplay && (
        <SearchResultModal
          spin={searchBarSpin}
          searchResult={searchResult}
          setSearchbarDisplay={setSearchbarDisplay}
          setClickedTag={setClickedTag}
        />
      )}
      <Navbar value={3} />
    </div>
  );
};

export default Upload;
