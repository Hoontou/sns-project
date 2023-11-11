import { Avatar, ListItem, ListItemAvatar } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { requestUrl } from '../../../common/etc';
import Spinner from '../../../common/Spinner';
import sample from '../../../asset/sample2.jpg';

//gateway에서 10개씩 보내줌.
//like.repo.ts , follow.repo.ts 에서 getUserIds함수랑 동기화
const pageLen = 15;

const LikeTab = (props: { targetPost: string | undefined }) => {
  const navigate = useNavigate();
  const [list, setList] = useState<
    { username: string; img: string; userId: string; introduceName: string }[]
  >([]);

  const [spin, setSpin] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const onClick = (username: string) => {
    navigate(`/feed/${username}`);
    window.location.reload();
  };

  const getUserList = () => {
    axios
      .post('/gateway/ffl/getuserlist', {
        id: props.targetPost,
        type: 'like',
        page,
      })
      .then((res) => {
        const data: {
          userList: {
            userId: string;
            img: string;
            username: string;
            introduceName: string;
          }[];
        } = res.data;
        console.log(data);

        if (data.userList.length < pageLen) {
          setHasMore(false);
        }

        setList([...list, ...data.userList]);
        setPage(page + 1);
        setSpin(false);
      });
  };

  useEffect(() => {
    getUserList();
  }, []);

  const renderCard = list.map((item, index) => {
    return (
      <ListItem
        key={index}
        onClick={() => {
          onClick(item.username);
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{ width: 50, height: 50 }}
            style={{ marginLeft: '0.7rem' }}
            alt={String(index)}
            src={item.img === '' ? sample : `${requestUrl}/${item.img}`}
          ></Avatar>
        </ListItemAvatar>
        <div>
          <div
            style={{
              marginLeft: '1rem',
              fontSize: '1.4rem',
              marginTop: '-0.2rem',
            }}
          >
            {item.username}
          </div>
          <div
            style={{
              marginLeft: '1rem',
              marginTop: '-0.4rem',
              fontSize: '0.9rem',
            }}
          >
            {item.introduceName}
          </div>
        </div>
      </ListItem>
    );
  });
  return (
    <div>
      <InfiniteScroll
        next={getUserList}
        hasMore={hasMore}
        loader={<></>}
        dataLength={list.length}
        scrollThreshold={'100%'}
      >
        {/* scrollThreshold={'90%'} 페이지 얼만큼 내려오면 다음거 불러올건지 설정 */}
        <div>{renderCard}</div>
      </InfiniteScroll>
      {spin && <Spinner />}
    </div>
  );
};

export default LikeTab;
