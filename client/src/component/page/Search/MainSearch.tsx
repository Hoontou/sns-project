import { useEffect, useState } from 'react';
import Navbar from '../../common/Navbar/Navbar';
import SearchBar from './SearchBar';
import { authHoc } from '../../../common/auth.hoc';
import { useNavigate } from 'react-router-dom';
const MainSearchPage = () => {
  const navigate = useNavigate();

  //인증 effect
  useEffect(() => {
    //다른곳에서는 실패하면 /signin으로 이동하게.
    authHoc().then((authRes) => {
      if (authRes.success === false) {
        alert('Err while Authentication, need login');
        navigate('/signin');
        return;
      }
      // setId(authRes.userId);
      // setUsername(authRes.username !== undefined ? authRes.username : '');
    });
  }, [navigate]);

  const [openSearchModal, setOpenSearchModal] = useState<boolean>(false);
  return (
    <div
      style={{
        width: '90%',
        margin: '0.7rem auto',
        paddingBottom: '3.5rem',
      }}
    >
      <div>
        <SearchBar
          setOpenSearchModal={setOpenSearchModal}
          openSearchModal={openSearchModal}
        />
      </div>
      <div>{!openSearchModal && <>this is main search page</>}</div>
      <div>
        <Navbar value={1} />
      </div>
    </div>
  );
};

export default MainSearchPage;
