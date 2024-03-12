import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AlertContentUnion } from 'sns-interfaces/alert.interface';
import { crypter } from 'src/common/crypter';
const PostMethod = 'post';
const GetMethod = 'get';
const DeleteMethod = 'delete';

const parseUrl = (url: string) => {
  return 'http://alert' + url;
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
export class DmService {}
