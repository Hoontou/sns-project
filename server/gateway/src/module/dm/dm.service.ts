import { Injectable } from '@nestjs/common';
import axios from 'axios';
const PostMethod = 'post';
const GetMethod = 'get';
const DeleteMethod = 'delete';

const parseUrl = (url: string) => {
  return 'http://dm' + url;
};

const axiosReq = (
  method: 'get' | 'post' | 'delete',
  url: string,
  body: { [key: string]: any },
) => {
  if (method === 'post') {
    return axios.post(parseUrl(url), body).then((res) => {
      return res.data;
    });
  }

  if (method === 'get') {
    return axios.get(parseUrl(url)).then((res) => {
      return res.data;
    });
  }

  return axios.delete(parseUrl(url), body).then((res) => {
    return res.data;
  });
};

@Injectable()
export class DmService {
  async requestChatRoomId(data: { userId: string; chatTargetUserId: string }) {
    const { chatRoomId }: { chatRoomId: number } = await axiosReq(
      PostMethod,
      '/requestChatRoomId',
      data,
    );

    return { chatRoomId };
  }
}
