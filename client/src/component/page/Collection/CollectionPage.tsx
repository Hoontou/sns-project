import { useEffect, useState } from 'react';
import { emptyMetadata, Metadata } from '../../common/Post/Postlist';
import axios from 'axios';
import { PageItemLen } from '../Search/MainPageTab/MainTab';
import { Box, Grid, Modal } from '@mui/material';
import { requestUrl } from '../../../common/etc';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from '../../common/Post/Post';
import { emptyPostFooterContent } from '../../common/Post/post.interfaces';
import { authHoc } from '../../../common/auth.hoc';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
import Navbar from '../../common/Navbar/Navbar';
const { Title } = Typography;

const CollectionPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [posts, setPosts] = useState<Metadata[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedItem, setItem] = useState<Metadata>(emptyMetadata);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  /**post가져오기 */
  const getPost = async () => {
    await axios
      .post('/gateway/metadata/getMyCollections', {
        page,
      })
      .then((res) => {
        const metadatas: Metadata[] = res.data.metadatas;
        if (metadatas.length < PageItemLen) {
          //gateway에서 9개씩 보내줌.
          setHasMore(false);
        }
        setPosts([...posts, ...metadatas]);
        setPage(page + 1);
      });
    return;
  };

  useEffect(() => {
    authHoc().then((res) => {
      if (res.success === false) {
        alert('Err while Authentication, need login');
        navigate('/signin');
        return;
      }

      setUserId(res.userId);
      getPost();
    });
    //post가져오기
    //뒤로가기버튼 시 모달끄기, 모달창 안에 histroy.pushState 해놔야함.
    const handleBack = (event: PopStateEvent) => {
      setOpen(false);
    };

    //뒤로가기 event리스너 등록
    window.addEventListener('popstate', handleBack);

    return () => {
      //이게 꼭 있어야한단다. 창 나갈때 반환인가?
      window.removeEventListener('popstate', handleBack);
    };
  }, []);

  const renderCard = posts.map((post, index) => {
    //이제 여기에 클릭하면 모달로 띄우는거 만들어야함
    return (
      <Grid item xs={4} key={post._id}>
        <div style={{ position: 'relative' }}>
          <span
            onClick={() => {
              setItem(posts[index]);
              setOpen(true);
            }}
          >
            <img
              style={{
                width: '100%',
                objectFit: 'cover',
                aspectRatio: '3/4.5',
              }}
              alt={`${index}`}
              src={`${requestUrl}/${post._id}/${post.files[0]}`}
            />
          </span>
        </div>
      </Grid>
    );
  });

  return (
    <div style={{ width: '97%', margin: '1.5rem auto' }}>
      <div>
        <Title level={3}>내 좋아요</Title>
      </div>
      <hr></hr>
      {posts.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            fontSize: '1.5rem',
            color: 'gray',
            marginTop: '3rem',
          }}
        >
          표시할 게시물이 없습니다.
        </div>
      )}
      {posts.length > 0 && (
        <>
          <InfiniteScroll
            next={getPost}
            hasMore={hasMore}
            loader={<div className='spinner'></div>}
            dataLength={posts.length}
            scrollThreshold={'95%'}
          >
            {/* scrollThreshold={'90%'} 페이지 얼만큼 내려오면 다음거 불러올건지 설정 */}
            <Grid container spacing={0.5}>
              {renderCard}
            </Grid>
          </InfiniteScroll>
          {open && (
            <Modal
              open={open}
              onClose={() => {
                setOpen(false);
              }}
            >
              <div id='post-modal'>
                <Box sx={{ bgcolor: 'white', width: '100%', height: '100%' }}>
                  <Post
                    userId={userId}
                    metadata={selectedItem}
                    postFooterContent={emptyPostFooterContent}
                  />
                </Box>
              </div>
            </Modal>
          )}
        </>
      )}

      <div style={{ paddingTop: '4rem' }}>
        <Navbar value={2} />
      </div>
    </div>
  );
};

export default CollectionPage;
