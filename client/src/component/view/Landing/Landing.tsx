import axios from 'axios';
import { useState, useEffect } from 'react';
import Navbar from '../../common/Navbar/Navbar';
import LandingPost from './LandingPost';
import LandingComment from './LandingComment';
import { Box, Modal, Button } from '@mui/material';
import { LandingContent, defaultLandingContent } from './interface';

const Landing = () => {
  const [page, setPage] = useState<number>(0);
  const [spin, setSpin] = useState<boolean>(false);
  const [openComment, setOpenComment] = useState<boolean>(false);
  const [posts, setPosts] = useState<LandingContent[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [targetPostIndex, setTargetPostIndex] = useState<number>(999);
  const [createdAtToComment, setCreatedAtToComment] = useState<string>('');
  const [postToComment, setPostToComment] = useState<LandingContent>(
    defaultLandingContent
  );
  const [pendingGettingPost, setPendingGettingPost] = useState<boolean>(false);
  const [enablingGetMoreButton, setEnablingGetMoreButton] =
    useState<boolean>(true);

  const openCo = (index: number) => {
    if (index === -1) {
      setOpenComment(false);
      return;
    }
    setPostToComment(posts[index]);
    setTargetPostIndex(index);
    setCreatedAtToComment(posts[index].createdAt);
    setOpenComment(!openComment);
    return;
  };

  const getPost = () => {
    setPendingGettingPost(true);
    axios.post('gateway/landing', { page }).then((res) => {
      const {
        last3daysPosts,
        userId,
      }: {
        last3daysPosts: LandingContent[];
        userId: string;
      } = res.data;
      if (page === 0) {
        setUserId(userId);
      }
      if (last3daysPosts.length < 10) {
        //gateway에서 10개씩 보내줌.
        setEnablingGetMoreButton(false);
      }
      setPage(page + 1);
      setPosts([...posts, ...last3daysPosts]);
      setPendingGettingPost(false);
      return;
    });
  };

  const renderPosts = posts.map((i, index) => {
    return (
      <>
        <LandingPost
          openCo={openCo}
          key={index}
          index={index}
          post={i}
          userId={userId}
        />
      </>
    );
  });

  useEffect(() => {
    getPost();

    //뒤로가기버튼 시 모달끄기, 모달창 안에 histroy.pushState 해놔야함.
    const handleBack = (event: PopStateEvent) => {
      openCo(-1);
    };

    //뒤로가기 event리스너 등록
    window.addEventListener('popstate', handleBack);

    return () => {
      //이게 꼭 있어야한단다. 창 나갈때 반환인가?
      window.removeEventListener('popstate', handleBack);
    };
  }, []);
  return (
    <>
      <div>{renderPosts}</div>
      {enablingGetMoreButton && (
        <div
          className='text-center'
          onClick={getPost}
          style={{ color: 'RoyalBlue' }}
        >
          {pendingGettingPost ? '가져오는 중...' : '더 불러오기'}
        </div>
      )}
      {openComment && (
        <Modal
          open={openComment}
          onClose={() => {
            setOpenComment(false);
          }}
        >
          <Box sx={{ bgcolor: 'white', width: '100%', height: '100%' }}>
            <LandingComment
              index={targetPostIndex}
              createdAt={createdAtToComment}
              postFooterContent={postToComment}
              userId={userId}
              openCo={openCo}
            />
          </Box>
        </Modal>
      )}
      <div style={{ paddingTop: '4rem' }}>
        <Navbar value={0} />
      </div>
    </>
  );
};
export default Landing;
