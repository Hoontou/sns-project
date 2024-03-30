import {
  Avatar,
  Dialog,
  DialogTitle,
  ListItem,
  ListItemAvatar,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sample from '../../asset/sample1.jpg';
import { requestUrl } from '../../common/etc';
// import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from '../../common/Spinner';
import { axiosInstance, primaryColor } from '../../App';

type ListType = 'like' | 'follower' | 'following';

const pageLen = 15;

/**좋아요, 팔로워, 팔로잉 한 유저리스트 보는 컴포넌트 */
const UserlistModal = (props: {
  open: boolean;
  targetId: string;
  setOpenUserList(open: boolean): void;
  type: ListType;
  targetUsername?: string;
}) => {
  const navigate = useNavigate();
  const [list, setList] = useState<
    { username: string; img: string; userId: string; introduceName: string }[]
  >([]);
  const [title, setTitle] = useState<string>('');
  const [spin, setSpin] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const onClick = (username: string) => {
    navigate(`/feed/${username}`);
    window.location.reload();
  };

  const getUserList = () => {
    if (props.type === 'like') {
      setTitle('좋아요');
    } else if (props.type === 'follower') {
      setTitle('팔로워');
    } else if (props.type === 'following') {
      setTitle('팔로잉');
    }
    axiosInstance
      .post('/ffl/getuserlist', {
        id: props.targetId,
        type: props.type,
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
          // gateway/에서 10개씩 보내줌.
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
      <Dialog
        onClose={() => props.setOpenUserList(!props.open)}
        open={props.open}
        className='text-center'
        fullWidth={true}
        maxWidth={'xs'}
        style={{
          maxHeight: '45rem',
          position: 'absolute',
          top: '15%',
        }}
      >
        <DialogTitle
          style={{
            marginRight: '1rem',
            marginLeft: '1rem',
            marginBottom: '-0.7rem',
          }}
        >
          {title}
        </DialogTitle>
        {list.length === 0 && !spin && <p>아무것도 없습니다.</p>}
        {renderCard}
        {hasMore && (
          <div
            style={{
              color: primaryColor,
              paddingBottom: '1rem',
              marginTop: '1rem',
            }}
            onClick={() => {
              navigate(
                `/ffl/${props.type}/${
                  props.type === 'like' ? props.targetId : props.targetUsername
                }`
              );
            }}
          >
            {title} 모두 보기
          </div>
        )}

        {spin && (
          <div style={{ position: 'absolute', left: '45%' }}>
            <Spinner />
          </div>
        )}
      </Dialog>
    </div>
  );
};
export default UserlistModal;
