import { MetadataDto } from './Postlist';
import Slider from './Slider';
import { useState, useEffect } from 'react';
import { VscHeart, VscComment } from 'react-icons/vsc';

const requestUrl =
  process.env.NODE_ENV === 'development' ? '/upload/files' : '';
//추후 azure url 추가해야함.

const Post = (props: { metadata: MetadataDto }) => {
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
      <div
        style={{ width: '95%', margin: '0.2rem auto', position: 'relative' }}
      >
        <VscHeart fontSize='30px' style={{ marginRight: '0.5rem' }} />
        <VscComment fontSize='30px' style={{ marginRight: '0.5rem' }} />
        <span style={{ position: 'absolute', bottom: '0', right: '0' }}>
          z9hoon님 외 좋아요 300개
        </span>
      </div>
      <div style={{ width: '95%', margin: '0.2rem auto', marginTop: '0.5rem' }}>
        <a
          style={{
            marginRight: '0.5rem',
            fontWeight: '600',
            fontSize: '1.1rem',
          }}
          href={`/userfeed/${props.metadata.userId}`}
        >
          {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
          hoontou
        </a>
        {props.metadata.title}
      </div>
    </div>
  );
};

export default Post;
