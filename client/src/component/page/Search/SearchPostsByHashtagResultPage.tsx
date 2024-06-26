import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../common/Navbar/Navbar';
import SearchPostList from './SearchPostList';
import { authHoc } from '../../../common/auth.hoc';

export const hasSpecialCharacters = (input: string): boolean => {
  const specialCharactersRegex = /^[0-9a-zA-Z\u3131-\uD79D]+$/;

  return !specialCharactersRegex.test(input);
};

//커밋로그
// 해시태그 검색결과를 프런트로 가져오기까지 완료, 이제 postlist.tsx를 보면서 무한스크롤 등등 비슷하게 구현 시작
// 포스트 사진 띄우는 레이아웃, 기능은 postlist.tsx랑 똑같으니 복붙만 잘하면 끝.
// metadata[]를 가져왔으니 postlist처럼 가공만 하면 됨.
//위 세줄 구현 전에 tag count 검색결과랑 태그 없을시 아무것도없습니다 표시 부터 구현
const SearchPostsByHashtagResultPage = () => {
  const { targetHashtag } = useParams(); //url에서 가져온
  const navigate = useNavigate();
  const [searchSuccess, setSearchSuccess] = useState<boolean>(true);
  const [totalPostCount, setTotalPostCount] = useState<number>(0);

  useEffect(() => {
    if (targetHashtag === undefined) {
      navigate('/');
      return;
    }

    if (hasSpecialCharacters(targetHashtag)) {
      alert('Invalid Access');
      navigate(-1);
      return;
    }

    authHoc().then((res) => {
      if (res.success === false) {
        alert('auth failed, need login');
        navigate('/signin');
        return;
      }
    });
  }, []);

  return (
    <div
      style={{ width: '90%', margin: '0.7rem auto', paddingBottom: '3.5rem' }}
    >
      {/* 상단 hashtag 이름, count 보여주고 */}
      <div
        style={{ fontSize: '2.5rem' }}
      >{`#${targetHashtag?.toLowerCase()}`}</div>
      <div style={{ marginTop: '-0.6rem', marginBottom: '-0.5rem' }}>
        게시물 {totalPostCount}
      </div>
      <hr></hr>
      {/* 아래 feed처럼 postlist 띄우고 */}
      <SearchPostList
        targetHashtag={targetHashtag?.toLowerCase()}
        setSearchSuccess={setSearchSuccess}
        setTotalPostCount={setTotalPostCount}
      />
      {/* 최하단 내브바 */}
      <Navbar value={1} />
    </div>
  );
};

export default SearchPostsByHashtagResultPage;
