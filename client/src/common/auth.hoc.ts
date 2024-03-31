import { AuthResultRes } from 'sns-interfaces';
import { axiosInstance } from '../App';

/** 메인백/유저/hoc로 가드체크, 쿠키필요 */
export const authHoc = async (): Promise<AuthResultRes> => {
  try {
    return await axiosInstance.get('/auth/auth').then((res) => {
      return res.data;
    });
  } catch {
    return { success: false };
  }
};
