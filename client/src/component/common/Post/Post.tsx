import { useState, useEffect } from 'react';
import Slider from '../Slider';
import PostFooter from './PostFooter';
import { requestUrl } from '../../../common/etc';
import { Metadata } from './Postlist';
import Comment from '../Comment/Comment';
import axios from 'axios';
import { emptyPostFooterContent } from './post.interfaces';
import { useNavigate } from 'react-router-dom';
import sample1 from '../../../asset/sample1.jpg';
import { PostFooterContent } from 'sns-interfaces/client.interface';
import { Avatar } from '@mui/material';

// export
const Post = (props: {
  metadata: Metadata;
  userId: string;
  postFooterContent: PostFooterContent;
}) => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [images, setImages] = useState<string[]>([]);
  const [openComment, setOpenComment] = useState<boolean>(false);
  const [postFooterContent, setPostFooterContent] = useState<PostFooterContent>(
    props.postFooterContent
  );

  //좋아요했는지, props.userid로 username, 좋아요수, 댓글수 gateway로 요청해서
  //state 채우고 컴포넌트에 표시

  useEffect(() => {
    const modyfiedUrl = props.metadata.files.map((i: string) => {
      return `${requestUrl}/${props.metadata.id}/${i}`;
    });
    setImages(modyfiedUrl);
  }, [props.metadata]);

  useEffect(() => {
    //뒤로가기 막기 위해 아래코드 필요.
    window.history.pushState(null, document.title, window.location.href);

    axios
      .post('/gateway/postfooter', {
        userId: props.userId,
        postId: props.metadata.id,
        targetId: props.metadata.userId,
      })
      .then((res) => {
        const data: PostFooterContent = res.data;
        setPostFooterContent({ ...data });
        setSpin(false);
      });
  }, [props.metadata.id, props.metadata.userId, props.userId]);

  return (
    // <div style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
    //상단 헤더부분
    <div>
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
              navigate(`/userfeed/${props.userId}`);
            }}
          >
            {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
            {postFooterContent.username}
          </span>
        </div>
      )}

      {/* 이거 상단에 게시글올린 유저정보 표시할건데, 만약 props로 전달안됐으면 표시 안하는걸로. */}
      {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기, 음.. 안해도될듯?*/}
      {!openComment && <Slider images={images} />}

      {!spin && !openComment && (
        <PostFooter
          postId={props.metadata.id}
          createdAt={props.metadata.createdAt}
          userId={props.userId}
          setOpenComment={setOpenComment}
          postFooterContent={postFooterContent}
        />
      )}
      {!spin && openComment && (
        <Comment
          createdAt={props.metadata.createdAt}
          postFooterContent={postFooterContent}
          userId={props.userId}
          setOpenComment={setOpenComment}
        />
      )}
    </div>
  );
};

export default Post;
