import { useState, useEffect } from 'react';
import Slider from '../Slider';
import { MetadataDto } from '../Postlist';
import PostHeader from './PostHeader';
import { requestUrl } from '../../../common/etc';

const Post = (props: { metadata: MetadataDto; userId: string }) => {
  const [images, setImages] = useState<string[]>([]);

  //좋아요했는지, props.userid로 username, 좋아요수, 댓글수 gateway로 요청해서
  //state 채우고 컴포넌트에 표시
  useEffect(() => {
    const modyfiedUrl = props.metadata.files.map((i: string) => {
      return `${requestUrl}/${props.metadata.id}/${i}`;
    });
    setImages(modyfiedUrl);
  }, [props.metadata]);

  return (
    <div style={{ width: '100%' }}>
      {/* 이거 상단에 게시글올린 유저정보 표시할건데, 만약 props로 전달안됐으면 표시 안하는걸로. */}
      {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기, 음.. 안해도될듯?*/}

      <Slider images={images} />
      <PostHeader metadata={props.metadata} userId={props.userId} />
    </div>
  );
};

export default Post;
