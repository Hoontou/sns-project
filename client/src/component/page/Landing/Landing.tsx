import { useState, useEffect } from 'react';
import Navbar from '../../common/Navbar/Navbar';
import LandingPost from './LandingPost';
import LandingComment from './LandingComment';
import { Box, Modal, Grid } from '@mui/material';
import { LandingContent, defaultLandingContent } from './interface';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';
import { authHoc } from '../../../common/auth.hoc';
import { AiOutlineAlert } from 'react-icons/ai';
import { IoMdPaperPlane } from 'react-icons/io';

import './Landing.css';
import { axiosInstance } from '../../../App';

const Landing = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(0);
  const [spin, setSpin] = useState<boolean>(false);
  const [isCommentOpen, setIsCommentOpen] = useState<boolean>(false);
  const [posts, setPosts] = useState<LandingContent[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [targetPostIndex, setTargetPostIndex] = useState<number>(999);
  const [createdAtToComment, setCreatedAtToComment] = useState<string>('');
  const [postToComment, setPostToComment] = useState<LandingContent>(
    defaultLandingContent
  );
  const [enablingGetMoreButton, setEnablingGetMoreButton] =
    useState<boolean>(true);

  const [hasNewAlert, setHasNewAlert] = useState<boolean>(false);
  const [hasNewMessage, setHasNewMessage] = useState<boolean>(false);

  const openComment = (index: number) => {
    if (index === -1) {
      setIsCommentOpen(false);
      return;
    }
    setPostToComment(posts[index]);
    setTargetPostIndex(index);
    setCreatedAtToComment(posts[index].createdAt);
    setIsCommentOpen(!isCommentOpen);
    return;
  };

  const getPost = () => {
    setSpin(true);
    axiosInstance.post('/landing', { page }).then((res) => {
      const {
        last3daysPosts,
      }: {
        last3daysPosts: LandingContent[];
      } = res.data;

      if (last3daysPosts.length < 10) {
        //gateway에서 10개씩 보내줌.
        setEnablingGetMoreButton(false);
      }

      setPage(page + 1);
      setPosts([...posts, ...last3daysPosts]);
      setSpin(false);
      return;
    });
  };

  useEffect(() => {
    authHoc().then((authRes) => {
      if (authRes.success === false) {
        navigate('/signin');
        return;
      }
      setUserId(authRes.userId);

      getPost();
      axiosInstance.get('/alert/checkHasNewAlert').then((res) => {
        const { hasNewAlert }: { hasNewAlert: boolean } = res.data;

        setHasNewAlert(hasNewAlert);
      });

      axiosInstance.get('/dm/checkHasNewMessage').then((res) => {
        const { hasNewMessage }: { hasNewMessage: boolean } = res.data;

        setHasNewMessage(hasNewMessage);
      });
    });

    //뒤로가기버튼 시 모달끄기, 모달창 안에 histroy.pushState 해놔야함.
    const handleBack = (event: PopStateEvent) => {
      setIsCommentOpen(false);
    };

    //뒤로가기 event리스너 등록
    window.addEventListener('popstate', handleBack);

    return () => {
      //이게 꼭 있어야한단다. 창 나갈때 반환인가?
      window.removeEventListener('popstate', handleBack);
    };
  }, []);

  const renderPosts = posts.map((i, index) => {
    return (
      <LandingPost
        openComment={openComment}
        key={`landing-${index}`}
        index={index}
        post={i}
        userId={userId}
      />
    );
  });

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '2.2rem',
          position: 'fixed',
          backgroundColor: 'white',
          zIndex: '999',
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={9}>
            <span
              style={{
                fontSize: '1.5rem',
                marginLeft: '0.5rem',
                fontWeight: '600',
              }}
            >
              CreamIsBeast
            </span>
          </Grid>
          <Grid item xs={3}>
            <div style={{ display: 'flex', justifyContent: 'right' }}>
              {/* <NotificationsNoneIcon
                fontSize='large'
                style={{ marginRight: '0.4rem' }}
                onClick={() => {
                  navigate('/alrt');
                }}
              /> */}
              <AiOutlineAlert
                className={hasNewAlert ? 'blink' : 'nonBlink'}
                style={{ fontSize: '34px' }}
                onClick={() => {
                  navigate('/alrt');
                }}
              />
              <IoMdPaperPlane
                className={hasNewMessage ? 'blink' : 'nonBlink'}
                fontSize='34px'
                style={{ marginRight: '0.5rem', marginTop: '1px' }}
                onClick={() => {
                  navigate('/direct/inbox');
                }}
              />
            </div>
          </Grid>
        </Grid>
      </div>

      <div style={{ paddingTop: '2.2rem' }}>
        <InfiniteScroll
          next={getPost}
          hasMore={enablingGetMoreButton}
          loader={<div className='spinner'></div>}
          dataLength={posts.length}
          scrollThreshold={'100%'}
        >
          {/* scrollThreshold={'90%'} 페이지 얼만큼 내려오면 다음거 불러올건지 설정 */}
          <div>{renderPosts}</div>
        </InfiniteScroll>
        {isCommentOpen && (
          <Modal
            open={isCommentOpen}
            onClose={() => {
              setIsCommentOpen(false);
            }}
          >
            <Box sx={{ bgcolor: 'white', width: '100%', height: '100%' }}>
              <LandingComment
                index={targetPostIndex}
                createdAt={createdAtToComment}
                postFooterContent={postToComment}
                userId={userId}
                openComment={openComment}
              />
            </Box>
          </Modal>
        )}
      </div>
      <div
        className='text-center'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
      >
        <div>최근 3일동안 새롭에 올라온 게시물을 모두 확인했습니다.</div>
        <span
          style={{ color: 'RoyalBlue' }}
          onClick={() => {
            navigate('/search');
          }}
        >
          다른 게시물 둘러보기
        </span>
      </div>
      <div style={{ paddingTop: '4rem' }}>
        <Navbar value={0} />
      </div>
    </>
  );
};
export default Landing;
