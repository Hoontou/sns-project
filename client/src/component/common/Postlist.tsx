import axios from 'axios';
import { useEffect, useState } from 'react';
import { Box, Grid, Modal } from '@mui/material';
import { postStyle } from '../mui.styled/item';
import Post from './Post/Post';

export interface MetadataDto {
  id: string;
  userId: string;
  files: string[];
  title: string;
  createdAt: Date;
} //sns-interfaces에 있는걸 쓰려고 했는데 리액트에서 자체적으로 _id에서 _를 빼버리고 id로 만들어버림.
//그래서 그냥 여기다 새로정의
const emptyDto: MetadataDto = {
  id: '',
  userId: '',
  files: [''],
  title: '',
  createdAt: new Date(),
};

const requestUrl =
  process.env.NODE_ENV === 'development' ? '/upload/files' : '';
//추후 azure url 추가해야함.

const Postlist = (props: { userId: string }) => {
  const [spin, setSpin] = useState<boolean>(true);
  const [posts, setPosts] = useState<MetadataDto[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedItem, setItem] = useState<MetadataDto>(emptyDto);
  const handleOpen = (index: number) => {
    setItem(posts[index]);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    axios
      .post('/gateway/metadata/getmetadatas', { userId: props.userId })
      .then((res) => {
        setSpin(false);
        const metadatas: MetadataDto[] = res.data.metadatas;
        if (metadatas !== undefined) {
          setPosts(metadatas);
        }
      });
  }, [props.userId]);

  const renderCard = posts.map((post, index) => {
    //이제 여기에 클릭하면 모달로 띄우는거 만들어야함
    return (
      <Grid item xs={4} key={index}>
        <div style={{ position: 'relative' }}>
          <a onClick={() => handleOpen(index)} href='#'>
            <img
              style={{ width: '100%', objectFit: 'cover', aspectRatio: '3/4' }}
              alt={`${index}`}
              src={`${requestUrl}/${post.id}/${post.files[0]}`}
            />
          </a>
        </div>
      </Grid>
    );
  });

  return (
    <div>
      {spin && 'waiting...'}
      <Grid container spacing={1}>
        {renderCard}
      </Grid>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            ...postStyle,
            width: '90%',
            height: 'auto',
            maxWidth: '900px',
            aspectRatio: '3/4',
          }}
        >
          <Post metadata={selectedItem} />
        </Box>
      </Modal>
    </div>
  );
};
export default Postlist;
