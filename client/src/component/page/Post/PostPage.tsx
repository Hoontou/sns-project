import { useState, useEffect } from 'react';
import { requestUrl } from '../../../common/etc';
import { useNavigate, useParams } from 'react-router-dom';
import sample1 from '../../../asset/sample1.jpg';
import { PostFooterContent } from 'sns-interfaces/client.interface';
import { Avatar } from '@mui/material';
import PostMenu from '../../common/Post/PostMenu';
import Slider from '../../common/Slider';
import PostFooter from '../../common/Post/PostFooter';
import Comment from '../../common/Comment/Comment';
import {
  emptyMetadata,
  emptyPostFooterContent,
} from '../../common/Post/post.interfaces';
import Navbar from '../../common/Navbar/Navbar';
import { axiosInstance } from '../../../App';
import { MetadataSchemaType } from 'sns-interfaces';

const PostPage = () => {
  const { postId } = useParams(); //url에서 가져온 username
  const [metadata, setMetadata] = useState<MetadataSchemaType>(emptyMetadata);
  const [userId, setUserId] = useState<string>('');

  const navigate = useNavigate();
  const [fulfilled, setFulfilled] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [openComment, setOpenComment] = useState<boolean>(false);
  const [postFooterContent, setPostFooterContent] = useState<PostFooterContent>(
    emptyPostFooterContent
  );
  const [displayPostMenu, setDisplayPostMenu] = useState<boolean>(false);

  //좋아요했는지, props.userid로 username, 좋아요수, 댓글수 gateway로 요청해서
  //state 채우고 컴포넌트에 표시

  const getPost = async () => {
    if (postId === undefined) {
      navigate('/');
      return;
    }

    //메타데이터 가져오기
    axiosInstance
      .post('/metadata/getMetadataWithPostFooter', {
        postId,
      })
      .then((res) => {
        const result:
          | {
              metadata: MetadataSchemaType;
              userId: string;
              postFooter: PostFooterContent;
            }
          | { metadata: undefined } = res.data;

        if (result.metadata === undefined) {
          return;
        }

        setMetadata(result.metadata);
        setUserId(result.userId);
        setPostFooterContent(result.postFooter);
        setFulfilled(true);
      })
      .catch((err) => {});
  };
  useEffect(() => {
    const modyfiedUrl = metadata.files.map((i: string) => {
      return `${requestUrl}/${metadata._id}/${i}`;
    });
    setImages(modyfiedUrl);
  }, [metadata]);

  useEffect(() => {
    getPost();

    setDisplayPostMenu(userId === metadata.userId ? true : false);

    //뒤로가기버튼 시 모달끄기, 모달창 안에 histroy.pushState 해놔야함.
    const handleBack = (event: PopStateEvent) => {
      setOpenComment(false);
    };

    //뒤로가기 event리스너 등록
    window.addEventListener('popstate', handleBack);

    return () => {
      //이게 꼭 있어야한단다. 창 나갈때 반환인가?
      window.removeEventListener('popstate', handleBack);
    };
  }, []);

  //게시물 찾아왔을때, missing일 때 리턴 다르게
  return metadata._id === '' ? ( //missing?
    <div style={{ overflowY: 'scroll', height: '100vh' }}>
      <>
        <div
          style={{
            textAlign: 'center',
            fontSize: '1rem',
            color: 'gray',
            marginTop: '4rem',
            marginBottom: '1rem',
          }}
        >
          삭제된 게시물 이거나 잘못된 접근입니다.
        </div>
        <div
          className='text-center'
          onClick={() => {
            navigate(-1);
          }}
          style={{ color: 'RoyalBlue' }}
        >
          뒤로가기
        </div>
      </>

      <div style={{ paddingTop: '4rem' }}>
        <Navbar value={0} />
      </div>
    </div>
  ) : (
    //find success?
    <div style={{ overflowY: 'scroll', height: '100vh' }}>
      {/* 상단 헤더 */}
      {!openComment && (
        <div style={{ height: '3.7rem', position: 'relative' }}>
          <Avatar
            alt='profile'
            src={
              postFooterContent.img === ''
                ? sample1
                : `${requestUrl}/${postFooterContent.img}`
            }
            sx={{
              marginTop: '0.5rem',
              width: '2.7rem',
              height: '2.7rem',
              marginLeft: '0.7rem',
              marginRight: '0.9rem',
              display: 'inline-block',
            }}
          />

          <span
            style={{
              fontWeight: '600',
              position: 'absolute',
              top: '1.2rem',
            }}
            onClick={() => {
              navigate(`/feed/${postFooterContent.username}`);
            }}
          >
            {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
            {postFooterContent.username}
          </span>
          {displayPostMenu && (
            <span
              style={{ position: 'absolute', right: '1rem', top: '0.7rem' }}
            >
              <PostMenu postId={metadata._id} />
            </span>
          )}
        </div>
      )}

      {/* 이거 상단에 게시글올린 유저정보 표시할건데, 만약 props로 전달안됐으면 표시 안하는걸로. */}
      {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기, 음.. 안해도될듯?*/}
      {!openComment && <Slider images={images} />}

      {!openComment && (
        <PostFooter
          postId={metadata._id}
          createdAt={metadata.createdAt}
          userId={userId}
          setOpenComment={setOpenComment}
          postFooterContent={postFooterContent}
          fulfilled={fulfilled}
        />
      )}
      {openComment && (
        <Comment
          createdAt={metadata.createdAt}
          postFooterContent={postFooterContent}
          userId={userId}
          setOpenComment={setOpenComment}
        />
      )}
      {!openComment && (
        <div style={{ paddingTop: '4rem' }}>
          <Navbar value={undefined} />
        </div>
      )}
    </div>
  );
};

export default PostPage;
