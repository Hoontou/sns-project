import { useEffect, useState } from 'react';
import { Box, Grid, Modal } from '@mui/material';
import { requestUrl } from '../../../common/etc';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  emptyMetadata,
  emptyPostFooterContent,
} from '../../common/Post/post.interfaces';
import Post from '../../common/Post/Post';
import Spinner from '../../../common/Spinner';
import { pageItemLen } from '../../common/Post/Postlist';
import { axiosInstance } from '../../../App';
import { MetadataSchemaType } from 'sns-interfaces';
import { staticImgServer } from '../../../common/randomImage';
import { BackSpin } from '../../../common/BackSpin';
import { useNavigate } from 'react-router-dom';

//targetId가 없으면 내 피드로 접근했다는 뜻.
//내 포스트를 가져오면 됨.
const SearchPostList = (props: {
  targetHashtag?: string;
  setSearchSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setTotalPostCount: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [posts, setPosts] = useState<MetadataSchemaType[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedItem, setItem] = useState<MetadataSchemaType>(emptyMetadata);
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
      await axiosInstance
        .post('/post/getpostsbyhashtag', {
          hashtag: props.targetHashtag,
          page,
        })
        .then((res) => {
          const data:
            | {
                metadatas: MetadataSchemaType[];
                searchSuccess: true;
                totalPostCount: number;
                userId: string;
              }
            | { searchSuccess: false } = res.data;

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
      alert('해시태그가 존재하지 않거나 잘못된 접근입니다.');
      navigate(-1);
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
              onError={(e: any) => {
                e.target.src = staticImgServer.getRandomImg(); // 이미지 로드 실패 시 디폴트 이미지로 변경
              }}
            />
          </span>
        </div>
      </Grid>
    );
  });

  return (
    <div>
      {spin && <BackSpin msg='게시물을 가져오는 중' />}
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
