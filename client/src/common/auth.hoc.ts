import axios from 'axios';
import { AuthResultRes, AuthSuccess } from 'sns-interfaces';

/** 메인백/유저/hoc로 가드체크, 쿠키필요 */
export const authHoc = async (): Promise<AuthResultRes> => {
  try {
    const authRes: AuthSuccess = await axios
      .get('/main-back/user/hoc')
      .then((res) => {
        return res.data;
      });
    // localStorage.setItem('userId', authRes.userId); //AES로 암호화 된 id 원래(int)
    // localStorage.setItem('username', authRes.username);

    return authRes;
  } catch {
    return { success: false };
  }
};
