import axios from 'axios';
import { useState, useEffect } from 'react';
import Navbar from '../../common/Navbar/Navbar';
import Post from '../../common/Post/Post';
import LandingPost from './LandingPost';

export interface LandingContent {
  userId: string;
  liked: boolean;
  username: string;
  img: string;
  id: string;
  title: string;
  likesCount: number;
  commentCount: number;
  files: string[];
  createdAt: string;
}

const Landing = () => {
  // const [posts, setPosts]
  const [page, setPage] = useState<number>(0);
  const [spin, setSpin] = useState<boolean>(true);
  const [openComent, setOpenCommeent] = useState<boolean>(true);
  const [posts, setPosts] = useState<LandingContent[]>([]);
  const [userId, setUserId] = useState<string>('');

  const getPost = () => {
    axios.post('gateway/landing', { page }).then((res) => {
      const {
        last3daysPosts,
        userId,
      }: {
        last3daysPosts: LandingContent[];
        userId: string;
      } = res.data;
      console.log(last3daysPosts);
      setPage(page + 1);
      setUserId(userId);
      setPosts([...posts, ...last3daysPosts]);
    });
  };

  const renderPosts = posts.map((i, index) => {
    return (
      <>
        <LandingPost key={index} post={i} userId={userId} />
      </>
    );
  });
  useEffect(() => {
    getPost();
  }, []);
  return (
    <>
      <div>{renderPosts}</div>
      <div style={{ paddingTop: '4rem' }}>
        <Navbar value={0} />
      </div>
    </>
  );
};
export default Landing;
