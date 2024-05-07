import { Dispatch, useEffect } from 'react';
import { Avatar, List, ListItem, ListItemAvatar } from '@mui/material';
import sample from '../../../asset/sample1.jpg';
import { requestUrl } from '../../../common/etc';
import Spinner from '../../../common/Spinner';
import { useNavigate } from 'react-router-dom';
import { primaryColor } from '../../../App';
import { SearchResult } from './interface';

export const removeHashIfFirst = (str: string) => {
  if (str.charAt(0) === '#' || str.charAt(0) === '@') {
    return str.slice(1);
  } else {
    return str;
  }
};

const MainSearchResultModal = (props: {
  spin: boolean;
  searchResult: SearchResult | undefined;
  searchString: string;
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (props.searchResult === undefined) {
      return;
    }
  }, [props.searchResult]);

  //창 켜져있을때 뒤로가기 누르면 창꺼짐
  useEffect(() => {
    //뒤로가기 막기 위해 아래코드 필요.
    window.history.pushState(null, document.title, window.location.href);
  }, []);

  const makeCard = (searchResult: SearchResult | undefined) => {
    if (searchResult === undefined) {
      return <></>;
    }
    if (searchResult.type === 'user') {
      return (
        <List sx={{ pt: 0 }} style={{ marginTop: '0.3rem' }}>
          {searchResult.resultList.map((item, index) => (
            <ListItem
              key={index}
              onClick={() => {
                navigate(`/feed/${item.username.substring(0)}`);
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{ width: 50, height: 50 }}
                  style={{ marginLeft: '-0.4rem' }}
                  alt={String(index)}
                  src={item.img === '' ? sample : `${requestUrl}/${item.img}`}
                ></Avatar>
              </ListItemAvatar>
              <div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    marginTop: '-0.2rem',
                  }}
                >
                  {item.username}
                </div>
                <div
                  style={{
                    marginTop: '-0.4rem',
                    fontSize: '0.9rem',
                  }}
                >
                  {item.introduceName}
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      );
    }

    if (searchResult.type === 'hashtag') {
      return (
        <List sx={{ pt: 0 }} style={{ marginTop: '0.3rem' }}>
          {searchResult.resultList.map((item, index) => (
            <ListItem
              key={index}
              onClick={() => {
                navigate(`/search/hashtag/${item.tagName.substring(0)}`);
              }}
            >
              <div>
                <div
                  style={{
                    marginLeft: '-0.4rem',
                    fontSize: '1.4rem',
                    marginTop: '-0.2rem',
                  }}
                >
                  #{item.tagName}
                </div>
                <div
                  style={{
                    marginLeft: '-0.4rem',
                    marginTop: '-0.4rem',
                    fontSize: '0.9rem',
                  }}
                >
                  게시물 {item.count}
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      );
    }
  };

  const renderItem =
    props.searchResult?.resultList.length === 0 ? (
      <div
        style={{
          fontSize: '1.5rem',
          color: 'gray',
          justifyContent: 'center',
          display: 'flex',
          marginTop: '7rem',
          paddingBottom: '5rem',
          marginLeft: '-3rem',
        }}
      >
        아무것도 없어요.
      </div>
    ) : (
      makeCard(props.searchResult)
    );
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 999,
        backgroundColor: 'white',
        width: '100%',
      }}
    >
      {props.spin && (
        <div
          style={{
            fontSize: '1.5rem',
            color: 'gray',
            justifyContent: 'center',
            display: 'flex',
            marginTop: '7rem',
            paddingBottom: '5rem',
            marginLeft: '-3rem',
          }}
        >
          <div style={{ position: 'absolute', top: '40%', left: '45%' }}>
            <Spinner />
          </div>
        </div>
      )}
      {!props.spin && renderItem}

      {props.searchString !== '' && !props.spin && (
        <div
          className='text-center'
          style={{
            color: primaryColor,
            marginTop: '1rem',
            paddingBottom: '2rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <span
            onClick={() => {
              navigate(`/search/all/${removeHashIfFirst(props.searchString)}`);
            }}
          >
            더 찾아보기
          </span>
        </div>
      )}
    </div>
  );
};

export default MainSearchResultModal;
