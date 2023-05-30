import axios from 'axios';
import { useState, useEffect } from 'react';
import Navbar from '../../common/Navbar/Navbar';
import Post from '../../common/Post/Post';

const Landing = () => {
  // const [posts, setPosts]
  const [page, setPage] = useState<number>(0);
  const [spin, setSpin] = useState<boolean>(true);
  const [openComent, setOpenCommeent] = useState<boolean>(true);

  const getPost = () => {
    axios.post('gateway/landing', { page }).then((res) => {
      const {
        last3daysPosts,
      }: {
        last3daysPosts: {
          postId: string;
          id: string;
          title: string;
          likesCount: number;
          commentCount: number;
          liked: boolean;
          username: string;
          img: string;
          _id: string;
          userId: string;
          files: string[];
        }[];
      } = res.data;

      console.log(last3daysPosts);
    });
  };

  // const renderPosts =
  useEffect(() => {
    getPost();
  }, []);
  return (
    <div className='text-center'>
      <Navbar value={0} />
    </div>
  );
};
export default Landing;
