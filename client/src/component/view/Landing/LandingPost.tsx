import axios from 'axios';
import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { requestUrl } from '../../../common/etc';
import PostFooter from '../../common/Post/PostFooter';
import { LandingContent } from './Landing';
import { Metadata, emptyMetadata } from '../../common/Post/Postlist';
import { PostFooterContent } from 'sns-interfaces/client.interface';
import { emptyPostFooterContent } from '../../common/Post/post.interfaces';
import { useNavigate } from 'react-router-dom';
import sample1 from '../../../asset/sample1.jpg';
import { Avatar } from '@mui/material';
import Slider from '../../common/Slider';
import LandingPostFooter from './LandingPostFooter';

const LandingPost = (props: {
  index: number;
  post: LandingContent;
  userId: string;
  openCo(index: number): void;
}) => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [images, setImages] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Metadata>(emptyMetadata);
  const [postFooterContent, setPostFooterContent] = useState<PostFooterContent>(
    emptyPostFooterContent
  );
  //좋아요했는지, props.userid로 username, 좋아요수, 댓글수 gateway로 요청해서
  //state 채우고 컴포넌트에 표시

  useEffect(() => {
    setMetadata(props.post);
    setPostFooterContent(props.post);
    const modyfiedUrl = props.post.files.map((i: string) => {
      return `${requestUrl}/${props.post.id}/${i}`;
    });
    setImages(modyfiedUrl);
    setSpin(false);
  }, []);

  return (
    <div style={{ width: '100%', marginBottom: '1rem' }}>
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
            navigate(`/userfeed/${postFooterContent.userId}`);
          }}
        >
          {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
          {postFooterContent.username}
        </span>
      </div>
      {!spin && <Slider images={images} />}
      {!spin && (
        <LandingPostFooter
          index={props.index}
          postId={metadata.id}
          createdAt={metadata.createdAt}
          userId={props.userId}
          openCo={props.openCo}
          postFooterContent={postFooterContent}
        />
      )}
    </div>
  );
};

export default LandingPost;
