import axios from 'axios';
import { useEffect, useState } from 'react';
import { Box, Button, Grid, Modal } from '@mui/material';
import { requestUrl } from '../../../common/etc';
import InfiniteScroll from 'react-infinite-scroll-component';
import { emptyPostFooterContent } from '../../common/Post/post.interfaces';
import Post from '../../common/Post/Post';
import Spinner from '../../../common/Spinner';
import { pageItemLen } from '../../common/Post/Postlist';

export interface MetadataDto {
  _id: string;
  userId: string;
  files: string[];
} //sns-interfaces에 있는걸 쓰려고 했는데 리액트에서 자체적으로 _id에서 _를 빼버리고 id로 만들어버림.
//그래서 그냥 여기다 새로정의

export interface Metadata extends MetadataDto {
  createdAt: string;
}
export const emptyMetadata: Metadata = {
  _id: '',
  userId: '',
  files: [''],
  createdAt: '',
};

//targetId가 없으면 내 피드로 접근했다는 뜻.
//내 포스트를 가져오면 됨.
const SearchPostList = (props: {
  targetHashtag?: string;
  setSearchSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setTotalPostCount: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [spin, setSpin] = useState<boolean>(true);
  const [posts, setPosts] = useState<Metadata[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedItem, setItem] = useState<Metadata>(emptyMetadata);
  const [page, setPage] = useState<number>(0);
  const [enablingGetMoreButton, setEnablingGetMoreButton] =
    useState<boolean>(true);
  const [userId, setUserId] = useState<string>('');
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
        .post('/gateway/post/getpostsbyhashtag', {
          hashtag: props.targetHashtag,
          page,
        })
        .then((res) => {
          const data:
            | {
                metadatas: Metadata[];
                searchSuccess: true;
                totalPostCount: number;
                userId: string;
              }
            | { searchSuccess: false } = res.data;
          console.log(data);

          //1. 태그찾기 실패시 리턴
          if (data.searchSuccess === false) {
            return;
          }

          if (page === 0) {
            //첫 요청일때만 초반세팅한다.
            props.setSearchSuccess(data.searchSuccess);
            props.setTotalPostCount(data.totalPostCount);
            setUserId(data.userId);
          }

          //2. 무한스크롤 핸들링
          if (data.metadatas.length < pageItemLen) {
            //gateway에서 9개씩 보내줌.
            //갯수 부족하면 무한스크롤 끄기
            setEnablingGetMoreButton(false);
          }

          //3. 가져온거 세팅
          setPosts([...posts, ...data.metadatas]);
          setPage(page + 1);
          return;
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
              <Box sx={{ bgcolor: 'white', width: '100%', height: '100%' }}>
                <Post
                  userId={userId}
                  metadata={selectedItem}
                  postFooterContent={emptyPostFooterContent}
                />
              </Box>
            </Modal>
          )}
        </>
      )}
      {spin && (
        <span style={{ position: 'absolute', left: '48%', top: '45%' }}>
          <Spinner />
        </span>
      )}
    </div>
  );
};
export default SearchPostList;
