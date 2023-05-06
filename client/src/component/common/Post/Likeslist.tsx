import {
  Avatar,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sample from '../../../asset/sample1.jpg';

const requestUrl =
  process.env.NODE_ENV === 'development' ? '/upload/files' : '';
//추후 azure url 추가해야함.

const Likeslist = (props: {
  open: boolean;
  postId: string;
  setOpenLikeslist(open: boolean): void;
}) => {
  const navigate = useNavigate();
  const [list, setList] = useState<
    { username: string; img: string; userId: string }[]
  >([]);

  const onClick = (userId: string) => {
    navigate(`/userfeed/${userId}`);
    //window.location.reload(); 이거 용도가 뭐였는지 생각이 안난다. 강제로 url리셋인거 같은데
  };

  useEffect(() => {
    axios
      .post('/gateway/ffl/openlikeslist', { postId: props.postId })
      .then((res) => {
        const data: {
          userList: { userId: string; img: string; username: string }[];
        } = res.data;
        setList(data.userList);
      });
  }, [props.postId]);
  return (
    <Dialog
      onClose={() => props.setOpenLikeslist(!props.open)}
      open={props.open}
      className='text-center'
    >
      <DialogTitle style={{ marginRight: '1rem', marginLeft: '1rem' }}>
        좋아요 누른 사람
      </DialogTitle>
      <List sx={{ pt: 0 }}>
        {list.map((item, index) => (
          <ListItem
            key={index}
            onClick={() => {
              onClick(item.userId);
            }}
          >
            <ListItemAvatar>
              <Avatar
                style={{ marginLeft: '-0.3rem' }}
                alt={String(index)}
                src={item.img === '' ? sample : `${requestUrl}/${item.img}`}
              ></Avatar>
            </ListItemAvatar>
            <ListItemText
              style={{ marginLeft: '-0.7rem' }}
              primary={item.username}
            />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};
export default Likeslist;
