import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReqUser } from 'sns-interfaces';
import { UserInfo } from 'sns-interfaces/client.interface';
import Userinfo from '../../common/Userinfo/Userinfo';
import Postlist from '../../common/Post/Postlist';
import Navbar from '../../common/Navbar/Navbar';
import Spinner from '../../../common/Spinner';
import { axiosInstance } from '../../../App';

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
  const [authinfo, setAuthinfo] = useState<ReqUser>({
    success: true,
    userId: '',
    username: '',
    introduceName: '',
  });
  const [userinfo, setUserinfo] = useState<UserInfo>(emptyUserInfo);
  const [feedType, setFeedType] = useState<'otherInfo' | 'myInfo'>('otherInfo');

  useEffect(() => {
    //타겟유저네임만 보내면, 가져와야할게 내정보인지 남의정보인지 판단.
    axiosInstance.post('/gateway/userinfo', { targetUsername }).then((res) => {
      const data:
        | {
            userinfo: UserInfo;
            type: 'otherInfo' | 'myInfo';
            reqUser: ReqUser;
            success: true;
          }
        | { success: false } = res.data;

      //username 찾기실패 or auth실패
      if (data.success === false) {
        alert(`not exist username or auth err`);
        navigate('/');
        return;
      }
      // if (data.reqUser.success === false) {
      //   alert('auth faild.');
      //   //여기 쿠키 다날리는 기능 추가해야함
      //   navigate('/signin');
      //   return;
      // }

      //이제 가져온 데이터 state에 채워넣기 시작
      setAuthinfo(data.reqUser);
      setUserinfo(data.userinfo);
      setFeedType(data.type);
      setSpin(false);
    });
  }, []);

  return (
    <div style={{ paddingBottom: '3.5rem', width: '97%', margin: 'auto' }}>
      {spin && (
        <div style={{ position: 'absolute', left: '45%', top: '30%' }}>
          <Spinner />
        </div>
      )}
      {!spin && (
        <>
          <div style={{ width: '95%', margin: '0.7rem auto' }}>
            <Userinfo
              spin={spin}
              authinfo={authinfo}
              userinfo={userinfo}
              feedType={feedType}
            />
          </div>

          <hr></hr>

          <Postlist
            userId={authinfo.success ? authinfo.userId : ''}
            targetId={userinfo.userId}
          />

          {/* 내브바 밖으로 빼면 feedType이 나중에 업데이트 돼서 
          내브바상태 업데이트 안됌 */}
          <Navbar value={feedType === 'myInfo' ? 4 : 0} />
        </>
      )}
    </div>
  );
};

export default Feed;
