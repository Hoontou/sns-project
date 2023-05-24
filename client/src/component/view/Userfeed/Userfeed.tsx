import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authHoc } from '../../../common/auth.hoc';
import Navbar from '../../common/Navbar/Navbar';
import Userinfo from '../../common/Userinfo/Userinfo';
import Postlist from '../../common/Post/Postlist';

const UserFeed = () => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [userId, setId] = useState<string>('');
  const [postCount, setPostCount] = useState<number>(0);

  const { targetid: targetUserId } = useParams();

  useEffect(() => {
    //다른곳에서는 실패하면 /signin으로 이동하게.
    authHoc().then((authRes) => {
      if (authRes.success === false) {
        alert('Err while Authentication, need login');
        navigate('/signin');
        return;
      }
      setSpin(false);
      if (authRes.userId === targetUserId) {
        //내 아이디로 내 피드 접근시 myfeed로 이동
        navigate('/myfeed');
        return;
      }
      setId(authRes.userId);
    });
  }, [navigate, targetUserId]);
  return (
    <div
      style={{ width: '90%', margin: '0.7rem auto', paddingBottom: '3.5rem' }}
    >
      {spin ? (
        'waiting...'
      ) : (
        <>
          <Userinfo
            userId={userId}
            targetId={targetUserId}
            setPostCount={setPostCount}
          />
          <Postlist
            userId={userId}
            targetId={targetUserId}
            postCount={postCount}
          />
        </>
      )}

      <Navbar value={0} />
    </div>
  );
};

export default UserFeed;
