import { useState, useEffect } from 'react';
import Slider from '../Slider';
import PostFooter from './PostFooter';
import { requestUrl } from '../../../common/etc';
import { MetadataDto } from './Postlist';
import Comment from '../Comment/Comment';
import axios from 'axios';
import { PostContent } from 'sns-interfaces';
import { emptyPostFooterContent } from './post.interfaces';
import { PostFooterContent } from './post.interfaces';

const Post = (props: { metadata: MetadataDto; userId: string }) => {
  const [spin, setSpin] = useState<boolean>(true);
  const [images, setImages] = useState<string[]>([]);
  const [openComment, setOpenComment] = useState<boolean>(true);
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
    axios
      .post('/gateway/postfooter', {
        userId: props.userId,
        postId: props.metadata.id,
        targetId: props.metadata.userId,
      })
      .then((res) => {
        const data: PostContent & {
          liked: boolean;
          username: string;
          img: string;
        } = res.data;
        setPostFooterContent({ ...data });
        setSpin(false);
      });
  }, [props.metadata.id, props.metadata.userId, props.userId]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 이거 상단에 게시글올린 유저정보 표시할건데, 만약 props로 전달안됐으면 표시 안하는걸로. */}
      {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기, 음.. 안해도될듯?*/}
      {!openComment && <Slider images={images} />}

      {!spin && !openComment && (
        <PostFooter
          metadata={props.metadata}
          userId={props.userId}
          setOpenComment={setOpenComment}
          postFooterContent={postFooterContent}
        />
      )}
      {!spin && openComment && (
        <Comment
          metadata={props.metadata}
          postFooterContent={postFooterContent}
          userId={props.userId}
        />
      )}
    </div>
  );
};

export default Post;
