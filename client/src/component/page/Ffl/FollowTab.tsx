import {
  Avatar,
  Box,
  ListItem,
  ListItemAvatar,
  Tab,
  Tabs,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sample from '../../../asset/sample2.jpg';
import { requestUrl } from '../../../common/etc';
import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from '../../../common/Spinner';
import FflSearchBar from './FflSearchBar';
import { axiosInstance } from '../../../App';

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

//userId, type, page 날려서 유저리스트 계속 가져오고,
//검색창 추가로 둬서 몽고 population 구현한거 이용해서 검색기능 적용
//검색기능은 자원 많이잡아먹을거기 때문에, 딜레이를 좀 걸자.

//유저리스트 가져오는건 userlistmodal에 있는 함수 그대로 쓰면 된다.
//usercard 만드는것도 가져오면 됨.

//일단 검색인풋 넣기보다, 무한스크롤로 리스트 가져오는것부터 구현
const FollowTab = (props: {
  target: string | undefined;
  defalutTab: number;
}) => {
  const [targetUserId, setTargetrUserId] = useState<string>('');
  const [tabIndex, setTabIndex] = useState<number>(0); //패널 선택
  const [followCount, setFollowCount] = useState<{
    follower: number;
    following: number;
  }>({ follower: 0, following: 0 });

  useEffect(() => {
    setTabIndex(props.defalutTab);
  }, [props.defalutTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  //두번의 요청보내자
  //1.한번은 팔로우숫자 채우기 용도
  //이건 userinfo api 재사용, user에 요청

  const getCountByUsername = () => {
    //유저에 요청
    axiosInstance
      .post('/user/getFollowCount', { username: props.target })
      .then((res) => {
        const result: { follower: number; following: number; userId: string } =
          res.data;
        setFollowCount({
          follower: result.follower,
          following: result.following,
        });
        setTargetrUserId(result.userId);
      });
  };

  useEffect(() => {
    getCountByUsername();
  }, []);

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          variant='fullWidth'
          value={tabIndex}
          onChange={handleTabChange}
          aria-label='basic tabs example'
          centered
        >
          <Tab label={`팔로워 ${followCount.follower}명`} {...a11yProps(0)} />
          <Tab label={`팔로잉 ${followCount.following}명`} {...a11yProps(1)} />
        </Tabs>
      </Box>
      <FollowListPannel
        index={0}
        value={tabIndex}
        targetUserId={targetUserId}
      />
      <FollowListPannel
        index={1}
        value={tabIndex}
        targetUserId={targetUserId}
      />
    </div>
  );
};

//gateway에서 10개씩 보내줌.
//like.repo.ts , follow.repo.ts 에서 getUserIds함수랑 동기화
const pageLen = 15;

export const FollowListPannel = (props: {
  index: number;
  value: number;
  targetUserId: string | undefined;
}) => {
  const navigate = useNavigate();
  const [list, setList] = useState<
    { username: string; img: string; userId: string; introduceName: string }[]
  >([]);

  const [spin, setSpin] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  //탭 왔다갔다할 때마다 계속 불러오는걸 막기위해
  const [firstReq, setFirstReq] = useState<boolean>(true);

  const [searchResult, setSearchResult] = useState<
    { username: string; introduceName: string; img: string }[] | undefined
  >(undefined);

  const onClick = (username: string) => {
    navigate(`/feed/${username}`);
    window.location.reload();
  };

  const getUserList = () => {
    if (props.value !== props.index) {
      return;
    }
    //탭 왔다갔다할 때마다 계속 불러오는걸 막기위해
    setFirstReq(false);

    axiosInstance
      .post('/ffl/getuserlist', {
        id: props.targetUserId,
        type: props.index === 0 ? 'follower' : 'following',
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
    if (props.targetUserId === '') {
      return;
    }

    if (firstReq === false) {
      //탭 왔다갔다할 때마다 계속 불러오는걸 막기위해
      return;
    }

    getUserList();
  }, [props.targetUserId, props.value]);

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

  const renderSearchCard = searchResult?.map((item, index) => {
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
    <div
      role='tabpanel'
      hidden={props.value !== props.index}
      id={`simple-tabpanel-${props.index}`}
      aria-labelledby={`simple-tab-${props.index}`}
      style={{ display: props.value === props.index ? 'block' : 'none' }}
    >
      {list.length > 0 && (
        <>
          <div>
            <FflSearchBar
              setSearchResult={setSearchResult}
              targetUserId={props.targetUserId}
              type={props.index === 0 ? 'follower' : 'following'}
            />
          </div>
          <div>
            {/* 검색결과가 채워져 있으면 */}
            {searchResult === undefined ? (
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
            ) : (
              <div>{renderSearchCard}</div>
            )}
            {spin && <Spinner />}
          </div>
        </>
      )}

      {list.length === 0 || searchResult?.length === 0 ? (
        <>
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
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default FollowTab;
