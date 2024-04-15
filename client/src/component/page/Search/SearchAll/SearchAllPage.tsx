import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authHoc } from '../../../../common/auth.hoc';
import Navbar from '../../../common/Navbar/Navbar';
import { SearchResultTab } from './SearchResultTap';

const SearchAllPage = () => {
  const { searchString } = useParams(); //url에서 가져온 username

  const navigate = useNavigate();
  const [userId, setId] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  //인증 effect
  useEffect(() => {
    //다른곳에서는 실패하면 /signin으로 이동하게.
    authHoc().then((authRes) => {
      if (authRes.success === false) {
        alert('Err while Authentication, need login');
        navigate('/signin');
        return;
      }
      setId(authRes.userId);
      setUsername(authRes.username !== undefined ? authRes.username : '');
    });
  }, [navigate]);

  const [openSearchModal, setOpenSearchModal] = useState<boolean>(false);
  return (
    <div style={{ paddingBottom: '3.5rem', width: '95%', margin: '0 auto' }}>
      {/* 도저히 검색인풋 넓이조절이 안돼서 삽질하다가 되는대로 구현했음, 코드개판임 */}
      <SearchResultTab
        searchString={searchString}
        userId={userId}
        setOpenSearchModal={setOpenSearchModal}
        openSearchModal={openSearchModal}
        defaultValue={searchString}
      />
      <div>
        <Navbar value={1} />
      </div>
    </div>
  );
};

export default SearchAllPage;
