import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserInfo } from 'sns-interfaces/client.interface';
import Userinfo from '../../common/Userinfo/Userinfo';
import Postlist from '../../common/Post/Postlist';
import Navbar from '../../common/Navbar/Navbar';
import Spinner from '../../../common/Spinner';
import { axiosInstance } from '../../../App';
import { hasSpecialCharacters } from '../Search/SearchPostsByHashtagResultPage';
import { BackSpin } from '../../../common/BackSpin';

export const emptyUserInfo: UserInfo = {
  userId: '',
  following: 0,
  follower: 0,
  postcount: 0,
  img: '',
  introduce: '',
  username: '',
  followed: false,
  introduceName: '',
};

//url파라미터에 담긴 걸로 그냥 요청날리면
//쿠키로 auth체크해서나온 이름이랑 같으면
//내정보 표시라는 뜻이고, 내정보에서의 버튼들 다 표시
const Feed = () => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const { targetUsername } = useParams(); //url에서 가져온 username
  const [reqUserId, setReqUserId] = useState<string>('');
  const [userinfo, setUserinfo] = useState<UserInfo>(emptyUserInfo);
  const [feedType, setFeedType] = useState<'otherInfo' | 'myInfo'>('otherInfo');

  useEffect(() => {
    //타겟유저네임만 보내면, 가져와야할게 내정보인지 남의정보인지 판단.
    axiosInstance.post('/userinfo', { targetUsername }).then((res) => {
      const data:
        | {
            userinfo: UserInfo;
            type: 'otherInfo' | 'myInfo';
            reqUserId: string;
            success: true;
          }
        | { success: false } = res.data;

      if (data.success === false) {
        alert('cannot found user or access denied');
        navigate('/');
        return;
      }

      //이제 가져온 데이터 state에 채워넣기 시작
      setReqUserId(data.reqUserId);
      setUserinfo(data.userinfo);
      setFeedType(data.type);
      setSpin(false);
    });
  }, []);

  return (
    <div style={{ paddingBottom: '3.5rem', width: '97%', margin: 'auto' }}>
      <BackSpin isOpen={spin} msg='정보를 가져오는 중' />
      {!spin && (
        <>
          <div style={{ width: '95%', margin: '0.7rem auto' }}>
            <Userinfo
              spin={spin}
              reqUserId={reqUserId}
              userinfo={userinfo}
              feedType={feedType}
            />
          </div>

          <hr></hr>

          <Postlist userId={reqUserId} targetId={userinfo.userId} />

          {/* 내브바 밖으로 빼면 feedType이 나중에 업데이트 돼서 
          내브바상태 업데이트 안됌 */}
          <Navbar value={feedType === 'myInfo' ? 4 : 0} />
        </>
      )}
    </div>
  );
};

export default Feed;
