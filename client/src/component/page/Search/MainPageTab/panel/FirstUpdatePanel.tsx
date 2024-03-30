import { useEffect, useState } from 'react';
import { emptyMetadata, Metadata } from '../../../../common/Post/Postlist';
import { PageItemLen } from '../MainTab';
import { Box, Grid, Modal } from '@mui/material';
import { requestUrl } from '../../../../../common/etc';
import { emptyPostFooterContent } from '../../../../common/Post/post.interfaces';
import Post from '../../../../common/Post/Post';
import InfiniteScroll from 'react-infinite-scroll-component';
import { axiosInstance } from '../../../../../App';

const FirstUpdatePanel = (props: {
  userId: string;
  index: number;
  targetIndex: number;
}) => {
  const [posts, setPosts] = useState<Metadata[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedItem, setItem] = useState<Metadata>(emptyMetadata);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  /**post가져오기 */
  const getPost = async () => {
    await axiosInstance
      .post('/metadata/getMetadatasOrderByDate', {
        by: 'first',
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
    if (props.targetIndex !== props.index || page !== 0) {
      //내 패널이 아니거나 처음 로딩이 아니라면 리턴
      return;
    }

    //post가져오기
    getPost();
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
  }, [props.targetIndex]);

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
    <div
      style={{ display: props.index !== props.targetIndex ? 'none' : 'block' }}
    >
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
                    userId={props.userId}
                    metadata={selectedItem}
                    postFooterContent={emptyPostFooterContent}
                  />
                </Box>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default FirstUpdatePanel;
