import { InputAdornment, OutlinedInput } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ChangeEvent, Dispatch, useEffect, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { SearchResult } from '../Upload/Upload';
import axios from 'axios';

const FflSearchBar = (props: {
  setSearchResult: Dispatch<
    React.SetStateAction<
      { username: string; introduceName: string; img: string }[] | undefined
    >
  >;
  targetUserId: string | undefined;
  type: 'follower' | 'following';
}) => {
  const [searchRequestString, setSearchRequestString] = useState<string>('');
  const [spin, setSpin] = useState<boolean>(false);
  //연속입력에 대한 검색딜레이 설정
  let timeoutId: NodeJS.Timeout | null = null;
  const delay = 1000; //ms기준임

  const onStringHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchRequestString(e.target.value);
  };

  const requestSearch = () => {
    axios
      .post('/gateway/ffl/searchUserFfl', {
        target: props.targetUserId,
        type: props.type,
        searchString: searchRequestString,
      })
      .then((res) => {
        const { userList } = res.data;
        props.setSearchResult(userList);
        setSpin(false);
        return;
      });
  };

  //웹소켓에 검색날리는 effect, 연속입력 대비해서  타임아웃 걸었음
  useEffect(() => {
    //글자없어지면 검색결과 삭제
    if (searchRequestString.length === 0) {
      console.log('clear');
      props.setSearchResult(undefined);
      return;
    }

    //두글자부터 검색시작
    if (searchRequestString.length < 2) {
      return;
    }

    //스핀돌리고
    setSpin(true);

    //검색탭에선 기본이 사람검색이기 때문에, 해시태그 검색이 아니면 @ 붙여줌

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      requestSearch();
    }, delay);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchRequestString]);

  return (
    <div style={{ width: '95%', margin: '0 auto', marginTop: '0.5rem' }}>
      <OutlinedInput
        id='outlined-adornment-weight'
        startAdornment={
          <InputAdornment position='start'>
            <SearchIcon />
          </InputAdornment>
        }
        endAdornment={
          spin === false ? (
            <ClearIcon
              onClick={() => {
                setSearchRequestString('');
              }}
              style={{ color: 'gray' }}
            />
          ) : (
            <MoreHorizIcon />
          )
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
          }
        }}
      />
    </div>
  );
};

export default FflSearchBar;
