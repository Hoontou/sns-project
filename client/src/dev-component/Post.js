import axios from 'axios';

const Post = () => {
  const onClick = async () => {
    const userUuid = await axios.get('/main-back/user/hoc').then((res) => {
      return res.data.userUuid;
    });
    axios.post('/metadata/getposts', { userUuid }).then((res) => {
      console.log(res);
    });
  };

  return (
    <div>
      this is post<button onClick={onClick}>getPosts</button>
    </div>
  );
};

export default Post;
