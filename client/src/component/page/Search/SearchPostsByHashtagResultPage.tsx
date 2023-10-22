import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Metadata, emptyMetadata } from '../../common/Post/Postlist';
import Navbar from '../../common/Navbar/Navbar';
import Spinner from '../../../common/Spinner';
import SearchPostlist from './SearchPostList';
import SearchPostList from './SearchPostList';

//커밋로그
// 해시태그 검색결과를 프런트로 가져오기까지 완료, 이제 postlist.tsx를 보면서 무한스크롤 등등 비슷하게 구현 시작
// 포스트 사진 띄우는 레이아웃, 기능은 postlist.tsx랑 똑같으니 복붙만 잘하면 끝.
// metadata[]를 가져왔으니 postlist처럼 가공만 하면 됨.
//위 세줄 구현 전에 tag count 검색결과랑 태그 없을시 아무것도없습니다 표시 부터 구현
const SearchPostsByHashtagResultPage = () => {
  const { targetHashtag } = useParams(); //url에서 가져온
  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [searchSuccess, setSearchSuccess] = useState<boolean>(true);
  const [totalPostCount, setTotalPostCount] = useState<number>(0);
  const [posts, setPosts] = useState<Metadata[]>([]);
  const [page, setPage] = useState<number>(0);
  const [enablingGetMoreButton, setEnablingGetMoreButton] =
    useState<boolean>(true);
  const [open, setOpen] = useState(false);
  const [selectedItem, setItem] = useState<Metadata>(emptyMetadata);

  useEffect(() => {
    if (targetHashtag === undefined) {
      navigate('/');
    }
  }, []);

  return (
    <div
      style={{ width: '90%', margin: '0.7rem auto', paddingBottom: '3.5rem' }}
    >
      {/* 상단 hashtag 이름, count 보여주고 */}
      <div style={{ fontSize: '2.5rem' }}>{`#${targetHashtag}`}</div>
      <div style={{ marginTop: '-0.6rem', marginBottom: '-0.5rem' }}>
        게시물 {totalPostCount}
      </div>
      <hr></hr>
      {/* 아래 feed처럼 postlist 띄우고 */}
      <SearchPostList
        targetHashtag={targetHashtag}
        setSearchSuccess={setSearchSuccess}
        setTotalPostCount={setTotalPostCount}
      />
      {/* 최하단 내브바 */}
      <Navbar value={1} />
    </div>
  );
};

export default SearchPostsByHashtagResultPage;
