import {
  Avatar,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
} from '@mui/material';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sample from '../../asset/sample1.jpg';
import { requestUrl } from '../../common/etc';

type ListType = 'like' | 'follower' | 'following';

/**좋아요, 팔로워, 팔로잉 한 유저리스트 보는 컴포넌트 */
const Userlist = (props: {
  open: boolean;
  targetId: string;
  setOpenUserList(open: boolean): void;
  type: ListType;
}) => {
  const navigate = useNavigate();
  const [list, setList] = useState<
    { username: string; img: string; userId: string; introduceName: string }[]
  >([]);
  const [title, setTitle] = useState<string>('');
  const [spin, setSpin] = useState<boolean>(true);

  const onClick = (userId: string) => {
    navigate(`/userfeed/${userId}`);
    //window.location.reload(); 이거 용도가 뭐였는지 생각이 안난다. 강제로 url리셋인거 같은데
  };

  useEffect(() => {
    if (props.type === 'like') {
      setTitle('좋아요');
    } else if (props.type === 'follower') {
      setTitle('팔로워');
    } else if (props.type === 'following') {
      setTitle('팔로잉');
    }
    axios
      .post('/gateway/ffl/getuserlist', {
        id: props.targetId,
        type: props.type,
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
        setList(data.userList);
        setSpin(false);
      });
  }, [props.targetId, props.type]);
  return (
    <Dialog
      onClose={() => props.setOpenUserList(!props.open)}
      open={props.open}
      className='text-center'
      fullWidth={true}
      maxWidth={'xs'}
    >
      {spin === true ? (
        'waiting...'
      ) : (
        <>
          <DialogTitle
            style={{
              marginRight: '1rem',
              marginLeft: '1rem',
            }}
          >
            {title}
          </DialogTitle>
          {list.length === 0 && <p>아무것도 없습니다.</p>}
          <List sx={{ pt: 0 }} style={{ maxHeight: '50vh' }}>
            {list.map((item, index) => (
              <ListItem
                key={index}
                onClick={() => {
                  onClick(item.userId);
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
            ))}
          </List>
        </>
      )}
    </Dialog>
  );
};
export default Userlist;
