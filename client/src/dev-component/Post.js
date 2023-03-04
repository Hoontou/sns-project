import axios from 'axios';
import { useState } from 'react';

const Post = () => {
  const [postList, setPostList] = useState([]);

  const onClick = async () => {
    const userUuid = await axios.get('/main-back/user/hoc').then((res) => {
      return res.data.userUuid;
    });
    axios.post('/metadata/getposts', { userUuid }).then(async (res) => {
      //res.data =  MetadataDto[]
      setPostList([...postList, ...res.data.posts]);
      //기존의 postlist에다가 뒤에 가져온 posts를 붙인다.
      //나중에 mongo에서 limit걸어서 스크롤 내릴수록 계속 불러올거임.
      //지금은 메타데이터에서 포스트를 싹다 불러와줌.
    });
    console.log(postList);
  };
  //https://snsupload.blob.core.windows.net/post_id/files[0]
  return (
    <div>
      this is post<button onClick={onClick}>getPosts</button>
      <div>
        {postList.map((i) => {
          return (
            <div>
              <h2>post_id = {i._id}</h2>
              <h3>title : {i.comment}</h3>
              {i.files.map((j) => {
                return (
                  <img
                    src={`https://snsupload.blob.core.windows.net/${i._id}/${j}`}
                    alt='img'
                  />
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
