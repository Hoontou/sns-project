import axios from 'axios';
import { useState, useEffect } from 'react';
import { requestUrl } from '../../../common/etc';
import PostFooter from '../../common/Post/PostFooter';
import { Metadata } from '../../common/Post/Postlist';
import { emptyPostFooterContent } from '../../common/Post/post.interfaces';
import { PostFooterContent } from 'sns-interfaces/client.interface';
import Slider from '../../common/Slider';

const Post = (props: { metadata: Metadata; userId: string }) => {
  const [spin, setSpin] = useState<boolean>(true);
  const [images, setImages] = useState<string[]>([]);
  const [openComment, setOpenComment] = useState<boolean>(false);
  const [postFooterContent, setPostFooterContent] = useState<PostFooterContent>(
    emptyPostFooterContent
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
    // window.history.pushState(null, document.title, window.location.href);

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
    <div style={{ width: '100%' }}>
      {/* 이거 상단에 게시글올린 유저정보 표시할건데, 만약 props로 전달안됐으면 표시 안하는걸로. */}
      {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기, 음.. 안해도될듯?*/}
      {!spin && <Slider images={images} />}

      {!spin && (
        <PostFooter
          postId={props.metadata.id}
          createdAt={props.metadata.createdAt}
          userId={props.userId}
          setOpenComment={setOpenComment}
          postFooterContent={postFooterContent}
        />
      )}
    </div>
  );
};

export default Post;
