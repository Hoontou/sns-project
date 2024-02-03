import axios from 'axios';
import { useEffect, useState } from 'react';
import { Box, Button, Grid, Modal } from '@mui/material';
import { requestUrl } from '../../../common/etc';
import Post from './Post';
import { emptyPostFooterContent } from './post.interfaces';
import InfiniteScroll from 'react-infinite-scroll-component';

export interface MetadataDto {
  id: string;
  userId: string;
  files: string[];
} //sns-interfaces에 있는걸 쓰려고 했는데 리액트에서 자체적으로 _id에서 _를 빼버리고 id로 만들어버림.
//그래서 그냥 여기다 새로정의

export interface Metadata extends MetadataDto {
  createdAt: string;
}
export const emptyMetadata: Metadata = {
  id: '',
  userId: '',
  files: [''],
  createdAt: '',
};

export const pageItemLen = 12;

//targetId가 없으면 내 피드로 접근했다는 뜻.
//내 포스트를 가져오면 됨.
const Postlist = (props: { userId: string; targetId?: string }) => {
  const [spin, setSpin] = useState<boolean>(true);
  const [posts, setPosts] = useState<Metadata[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedItem, setItem] = useState<Metadata>(emptyMetadata);
  const [page, setPage] = useState<number>(0);
  const [enablingGetMoreButton, setEnablingGetMoreButton] =
    useState<boolean>(true);
  console.log(props.userId);
  useEffect(() => {
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
  }, []);

  /**post가져오기 */
  const getPost = async () => {
    setSpin(true);
    try {
      await axios
        .post('/gateway/metadata/getmetadatas', {
          userId: props.targetId === undefined ? props.userId : props.targetId,
          page,
        })
        .then((res) => {
          const metadatas: Metadata[] = res.data.metadatas;
          if (metadatas.length < pageItemLen) {
            //gateway에서 9개씩 보내줌.
            setEnablingGetMoreButton(false);
          }
          setPosts([...posts, ...metadatas]);
          setPage(page + 1);
        });
    } catch (error) {
      //아직 에러처리 생각안함
      return;
    } finally {
      setSpin(false);
      return;
    }
  };

  const renderCard = posts.map((post, index) => {
    //이제 여기에 클릭하면 모달로 띄우는거 만들어야함
    return (
      <Grid item xs={4} key={post.id}>
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
              src={`${requestUrl}/${post.id}/${post.files[0]}`}
            />
          </span>
        </div>
      </Grid>
    );
  });

  return (
    <div>
      {spin && 'waiting...'}
      {!spin && posts.length === 0 && (
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
            hasMore={enablingGetMoreButton}
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
export default Postlist;
