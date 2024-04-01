import { useState, useEffect, Dispatch, ChangeEvent } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { Socket, io } from 'socket.io-client';
import { InputAdornment, OutlinedInput } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import MainSearchResultModal from './MainSearchModal';
import { SearchResult } from './interface';

const SearchBar = (props: {
  setOpenSearchModal: Dispatch<React.SetStateAction<boolean>>;
  openSearchModal: boolean;
  defaultValue?: string;
}) => {
  const [searchSocket, setSearchSocket] = useState<Socket | undefined>(
    undefined
  );
  const [searchRequestString, setSearchRequestString] = useState<string | ''>(
    props.defaultValue !== undefined ? props.defaultValue : ''
  );
  const [searchResult, setSearchResult] = useState<SearchResult | undefined>(
    undefined
  );

  //검색결과창 컨트롤
  const [searchBarSpin, setSearchBarSpin] = useState<boolean>(false);
  //연속입력에 대한 검색딜레이 설정
  let timeoutId: NodeJS.Timeout | null = null;
  const delay = 700; //ms기준임

  //소켓연결 함수, 자식인 titleInput에서 실행함
  const connectSocket = () => {
    if (searchSocket === undefined) {
      const socket = io('/search');
      socket.on('searchUserOrHashtagResult', (data: SearchResult) => {
        setSearchResult(data);
        //데이터 가져왔으면 스핀멈춘다
        setSearchBarSpin(false);
      });
      setSearchSocket(socket);
    }
  };

  const onStringHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchRequestString(e.target.value);
  };

  //웹소켓에 검색날리는 effect, 연속입력 대비해서  타임아웃 걸었음
  useEffect(() => {
    connectSocket();

    //글자없어지면 검색결과 삭제
    //해시태그 검색일 때, 두글자부터 검색시작
    if (searchRequestString.at(0) === '#' && searchRequestString.length < 2) {
      setSearchResult(undefined);
      return;
    }
    //사람 검색일 때,
    if (searchRequestString.at(0) !== '#' && searchRequestString.length < 1) {
      setSearchResult(undefined);
      return;
    }

    //스핀돌리고
    setSearchBarSpin(true);

    //검색탭에선 기본이 사람검색이기 때문에, 해시태그 검색이 아니면 @ 붙여줌
    const tmpString =
      searchRequestString.at(0) !== '#'
        ? '@' + searchRequestString
        : searchRequestString;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      //데이터 받아왔으면 스핀멈추고(이건 socket.on에서 수행)

      searchSocket?.emit('searchUserOrHashtag', {
        searchString: tmpString,
      });
    }, delay);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchRequestString]);

  useEffect(() => {
    if (searchRequestString === '') {
      return;
    }
    if (props.openSearchModal === true && searchResult === undefined) {
      connectSocket();

      //검색탭에선 기본이 사람검색이기 때문에, 해시태그 검색이 아니면 @ 붙여줌
      const tmpString =
        searchRequestString.at(0) !== '#'
          ? '@' + searchRequestString
          : searchRequestString;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        //창띄우고 스핀돌리고, 데이터 받아왔으면 스핀멈추고(이건 socket.on에서 수행)

        setSearchBarSpin(true);
        searchSocket?.emit('searchUserOrHashtag', {
          searchString: tmpString,
        });
      }, delay);

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, [props.openSearchModal]);

  //뒤로가기로 검색모달 끄는 useEffect
  useEffect(() => {
    //뒤로가기버튼 시 모달끄기, 모달창 안에 histroy.pushState 해놔야함.
    const handleBack = (event: PopStateEvent) => {
      props.setOpenSearchModal(false);
    };

    //뒤로가기 event리스너 등록
    window.addEventListener('popstate', handleBack);

    return () => {
      //이게 꼭 있어야한단다. 창 나갈때 반환인가?
      window.removeEventListener('popstate', handleBack);
    };
  }, []);

  // useEffect(() => {
  //   if (props.openSearchModal && sear) {
  //     connectSocket();
  //   }
  // }, [props.openSearchModal]);

  return (
    <div>
      <OutlinedInput
        onClick={() => {
          props.setOpenSearchModal(true);
        }}
        id='outlined-adornment-weight'
        startAdornment={
          <InputAdornment position='start'>
            <SearchIcon />
          </InputAdornment>
        }
        endAdornment={
          <ClearIcon
            onClick={() => {
              setSearchRequestString('');
            }}
            style={{ color: 'gray' }}
          />
        }
        value={searchRequestString}
        aria-describedby='outlined-weight-helper-text'
        inputProps={{
          'aria-label': 'weight',
        }}
        fullWidth
        size='small'
        onChange={onStringHandler}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            window.location.replace(`/search/all/${searchRequestString}`);
          }
        }}
      />
      {props.openSearchModal && (
        <MainSearchResultModal
          spin={searchBarSpin}
          searchResult={searchResult}
          searchString={searchRequestString}
        />
      )}
    </div>
  );
};

export default SearchBar;
