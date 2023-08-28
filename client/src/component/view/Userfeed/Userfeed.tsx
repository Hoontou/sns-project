import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReqUser } from 'sns-interfaces';
import { UserInfo } from 'sns-interfaces/client.interface';
import Userinfo from '../../common/Userinfo/Userinfo';
import Postlist from '../../common/Post/Postlist';
import Navbar from '../../common/Navbar/Navbar';

export const emptyUserInfo: UserInfo = {
  userId: '',
  following: 0,
  follower: 0,
  postcount: 0,
  img: '',
  introduce: '',
  username: '',
  followed: false,
};

//url파라미터에 담긴 걸로 그냥 요청날리면
//쿠키로 auth체크해서나온 이름이랑 같으면
//내정보 표시라는 뜻이고, 내정보에서의 버튼들 다 표시
const Userfeed = () => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const { targetUsername } = useParams(); //url에서 가져온 username
  const [authinfo, setAuthinfo] = useState<ReqUser>({
    success: true,
    userId: '',
    username: '',
  });
  const [userinfo, setUserinfo] = useState<UserInfo>(emptyUserInfo);
  const [feedType, setFeedType] = useState<'otherInfo' | 'myInfo' | null>(null);

  useEffect(() => {
    //타겟유저네임만 보내면, 가져와야할게 내정보인지 남의정보인지 판단.
    axios.post('/gateway/userinfo', { targetUsername }).then((res) => {
      const data:
        | {
            userinfo: UserInfo;
            type: 'otherInfo' | 'myInfo';
            reqUser: ReqUser;
            success: true;
          }
        | { success: false } = res.data;

      // console.log(data);

      //username 찾기실패
      if (data.success === false) {
        alert(`${targetUsername}은 없는 유저임.`);
        navigate('/');
        return;
      }
      if (data.reqUser.success === false) {
        alert('auth faild.');
        //여기 쿠키 다날리는 기능 추가해야함
        navigate('/signin');
        return;
      }

      //이제 가져온 데이터 state에 채워넣기 시작
      setAuthinfo(data.reqUser);
      setUserinfo(data.userinfo);
      setFeedType(data.type);
      setSpin(false);
    });
  }, []);

  return (
    <div
      style={{ width: '90%', margin: '0.7rem auto', paddingBottom: '3.5rem' }}
    >
      {spin ? (
        'waiting...'
      ) : (
        <>
          <Userinfo
            spin={spin}
            authinfo={authinfo}
            userinfo={userinfo}
            feedType={feedType}
          />
          <Postlist
            userId={
              feedType === 'myInfo' && authinfo.success === true //내피드 이면 내아이디 넘김
                ? authinfo.userId
                : userinfo.userId
            }
          />
        </>
      )}

      <Navbar value={0} />
    </div>
  );
};

export default Userfeed;
