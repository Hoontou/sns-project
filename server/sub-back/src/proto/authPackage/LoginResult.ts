// Original file: src/proto/auth.proto

import type {
  LoginCode as _authPackage_LoginCode,
  LoginCode__Output as _authPackage_LoginCode__Output,
} from '../authPackage/LoginCode';

export interface LoginResult {
  loginCode?: _authPackage_LoginCode;
  token?: string;
  _token?: 'token';
}

export interface LoginResult__Output {
  loginCode?: _authPackage_LoginCode__Output;
  token?: string;
}
