import axios from 'axios';
import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';

interface MetadataDto {
  id: string;
  userId: string;
  files: string[];
  title: string;
  createdAt: Date;
} //sns-interfaces에 있는걸 쓰려고 했는데 리액트에서 자체적으로 _id에서 _를 빼버리고 id로 만들어버림.
//그래서 그냥 여기다 새로정의

const Postlist = (props: { userId: string }) => {
  const [posts, setPosts] = useState<MetadataDto[]>([]);
  const requestUrl =
    process.env.NODE_ENV === 'development' ? '/upload/files' : '';
  useEffect(() => {
    axios
      .post('/gateway/metadata/getmetadatas', { userId: props.userId })
      .then((res) => {
        const metadatas: MetadataDto[] = res.data.metadatas;
        setPosts(metadatas);
      });
  }, []);

  const renderCard = posts.map((post, index) => {
    //이제 여기에 클릭하면 모달로 띄우는거 만들어야함
    return (
      <Grid item xs={4} key={index}>
        <div style={{ position: 'relative' }}>
          <img
            style={{ width: '100%' }}
            alt='thumbnail'
            src={`${requestUrl}/${post.id}/${post.files[0]}`}
          />
        </div>
      </Grid>
    );
  });
  return (
    <div>
      <Grid container spacing={1}>
        {renderCard}
      </Grid>
    </div>
  );
};
export default Postlist;
