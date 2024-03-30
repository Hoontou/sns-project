import { useEffect, useState } from 'react';
import { Avatar, List, ListItem, ListItemAvatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SearchedUser } from 'sns-interfaces/grpc.interfaces';
import sample from '../../../../../../asset/sample1.jpg';
import { requestUrl } from '../../../../../../common/etc';
import Spinner from '../../../../../../common/Spinner';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TabPanelProps } from '../../SearchResultTap';
import { axiosInstance } from '../../../../../../App';

//user서버의 elastic.ts의 searchUsersBySearchString메서드와 동기화
const pageLen = 20; //한번에 몇개의 유저 가져올지

export const UserPanel = (props: TabPanelProps) => {
  const { children, value, index, userId, searchString } = props;
  const navigate = useNavigate();
  const [searchedUserList, setSearchedUserList] = useState<
    SearchedUser[] | undefined
  >(undefined);
  const [spin, setSpin] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  //더 가져올 유저가 있는가?
  const [hasMore, setHasMore] = useState<boolean>(true);

  const searchUsersBySearchString = () => {
    return axiosInstance
      .post('/user/searchusersbysearchstring', {
        searchString,
        page,
      })
      .then((res) => {
        const data: { userList: SearchedUser[] } = res.data;
        if (data.userList.length < pageLen) {
          setHasMore(false);
        }

        setSearchedUserList(
          searchedUserList === undefined
            ? data.userList
            : [...searchedUserList, ...data.userList]
        );
        setPage(page + 1);
        setSpin(false);
      });
  };

  useEffect(() => {
    if (value === 1 && searchedUserList === undefined) {
      searchUsersBySearchString();
    }
  }, [value]);

  const makeCard = () => {
    return (
      <List sx={{ pt: 0 }} style={{ marginTop: '0.3rem' }}>
        {searchedUserList?.map((item, index) => (
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
  };

  const renderItem =
    searchedUserList?.length === 0 ? (
      <div
        style={{
          fontSize: '1.5rem',
          color: 'gray',
          justifyContent: 'center',
          display: 'flex',
          marginTop: '7rem',
        }}
      >
        아무것도 없어요.
      </div>
    ) : (
      makeCard()
    );

  return (
    <div
      role='tabpanel'
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ display: value === 1 ? 'block' : 'none' }}
    >
      {spin && (
        <div style={{ position: 'absolute', left: '48%', top: '45%' }}>
          <Spinner />
        </div>
      )}

      <InfiniteScroll
        next={searchUsersBySearchString}
        hasMore={hasMore}
        loader={<div className='spinner'></div>}
        dataLength={
          searchedUserList === undefined ? 0 : searchedUserList.length
        }
        scrollThreshold={'95%'}
      >
        {/* scrollThreshold={'90%'} 페이지 얼만큼 내려오면 다음거 불러올건지 설정 */}
        {!spin && renderItem}
      </InfiniteScroll>
    </div>
  );
};
