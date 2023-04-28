import { useEffect, useState } from 'react';
import { authHoc } from '../../../common/auth.hoc';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../common/Navbar/Navbar';

import Userinfo from '../../common/Userinfo';
import Postlist from '../../common/Postlist';

const MyFeed = () => {
  const navigate = useNavigate();

  const [spin, setSpin] = useState<boolean>(true);
  const [userId, setId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  useEffect(() => {
    //다른곳에서는 실패하면 /signin으로 이동하게.
    authHoc().then((authRes) => {
      if (authRes.success === false) {
        alert('Err while Authentication, need login');
        navigate('/signin');
        return;
      }
      setSpin(false);
      setId(authRes.userId);
      setUsername(authRes.username);
    });
  }, [navigate]);
  return (
    <div
      style={{ width: '90%', margin: '0.7rem auto', paddingBottom: '3.5rem' }}
    >
      {spin ? (
        'waiting...'
      ) : (
        <>
          <Userinfo userId={userId} username={username} />
          <Postlist userId={userId} />
        </>
      )}

      <Navbar value={4} />
    </div>
  );
};

export default MyFeed;
