import axios from 'axios';
import { useState } from 'react';

interface MetadataDto {
  _id: string;
  userId: string;
  files: string[];
  title: string;
  createdAt: Date;
}

const Post = () => {
  const [postList, setPostList] = useState<Array<MetadataDto>>([]);

  const onClick = async () => {
    const userId = await axios.get('/main-back/user/hoc').then((res) => {
      return res.data.userId;
    });
    console.log(userId);
    axios.post('/metadata/getposts', { userId }).then((res) => {
      //res.data =  MetadataDto[]
      const posts: MetadataDto[] = res.data.posts;
      console.log(posts);
      setPostList([...postList, ...posts]);
      //기존의 postlist에다가 뒤에 가져온 posts를 붙인다.
      //나중에 mongo에서 limit걸어서 스크롤 내릴수록 계속 불러올거임.
      //지금은 메타데이터에서 포스트를 싹다 불러와줌. 한번만 클릭해
    });
  };
  //https://snsupload.blob.core.windows.net/postId/files[0]
  return (
    <div>
      this is post<button onClick={onClick}>getPosts</button>
      <div>
        {postList.map((i) => {
          return (
            <div>
              {i.files.map((j) => {
                return (
                  <div>
                    <img
                      src={`https://snsupload.blob.core.windows.net/${i._id}/${j}`}
                      alt='img'
                    />
                    <h4>{i.title}</h4>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Post;
