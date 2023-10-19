import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SearchBar from '../SearchBar';
import { authHoc } from '../../../../common/auth.hoc';
import Navbar from '../../../common/Navbar/Navbar';
import { SearchTap } from './TabPanel';

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
          defaultValue={searchString}
        />
      </div>
      <SearchTap searchString={searchString} />
      <div>
        <Navbar value={1} />
      </div>
    </div>
  );
};

export default SearchAllPage;
