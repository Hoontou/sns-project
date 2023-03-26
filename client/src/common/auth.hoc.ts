import axios from 'axios';
import { AuthResultRes } from 'sns-interfaces';

/** 메인백/유저/hoc로 가드체크, 쿠키필요 */
export const authHoc = async (): Promise<boolean> => {
  let success: boolean = false;
  await axios.get('/main-back/user/hoc').then((res) => {
    const result: AuthResultRes = res.data;
    if (result.success === true) {
      //AuthSuccess
      localStorage.setItem('userId', result.userId); //AES로 암호화 된 id 원래(int)
      localStorage.setItem('username', res.data.username);
      success = true;
    }
  });
  return success;
};
