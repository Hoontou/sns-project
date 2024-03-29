import { useEffect, useState } from 'react';
import Navbar from '../../common/Navbar/Navbar';
import SearchBar from './SearchBar';
import { authHoc } from '../../../common/auth.hoc';
import { useNavigate } from 'react-router-dom';
import MainTab from './MainPageTab/MainTab';
const MainSearchPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');

  //인증 effect
  useEffect(() => {
    //다른곳에서는 실패하면 /signin으로 이동하게.
    authHoc().then((authRes) => {
      if (authRes.success === false) {
        alert('Err while Authentication, need login');
        navigate('/signin');
        return;
      }
      setUserId(authRes.userId);
      // setUsername(authRes.username !== undefined ? authRes.username : '');
    });
  }, [navigate]);

  const [openSearchModal, setOpenSearchModal] = useState<boolean>(false);
  return (
    <div
      style={{
        paddingBottom: '3.5rem',
      }}
    >
      <div
        style={{
          width: '95%',
          margin: '0.7rem auto',
        }}
      >
        <SearchBar
          setOpenSearchModal={setOpenSearchModal}
          openSearchModal={openSearchModal}
        />
        <hr></hr>
      </div>
      <div>
        <MainTab userId={userId} />
      </div>
      <div>
        <Navbar value={1} />
      </div>
    </div>
  );
};

export default MainSearchPage;
