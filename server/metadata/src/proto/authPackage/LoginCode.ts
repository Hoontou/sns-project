// Original file: src/proto/auth.proto

export const LoginCode = {
  SUCCESS: 0,
  FAIL: 1,
} as const;

export type LoginCode = 'SUCCESS' | 0 | 'FAIL' | 1;

export type LoginCode__Output = (typeof LoginCode)[keyof typeof LoginCode];
