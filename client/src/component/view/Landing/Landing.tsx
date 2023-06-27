import axios from 'axios';
import { useState, useEffect } from 'react';
import Navbar from '../../common/Navbar/Navbar';
import Post from '../../common/Post/Post';

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
      setPage(page + 1);
      setUserId(userId);
      setPosts([...posts, ...last3daysPosts]);
    });
  };

  const renderPosts = posts.map((i, index) => {
    return (
      <Post
        key={index}
        metadata={{
          id: i.id,
          userId: i.userId,
          files: i.files,
          createdAt: i.createdAt,
        }}
        userId={userId}
        postFooterContent={{
          id: i.id,
          title: i.title,
          likesCount: i.likesCount,
          commentCount: i.commentCount,
          liked: i.liked,
          username: i.username,
          img: i.img,
        }}
      />
    );
  });
  useEffect(() => {
    getPost();
  }, []);
  return (
    <div>
      {renderPosts}
      <Navbar value={0} />
    </div>
  );
};
export default Landing;
