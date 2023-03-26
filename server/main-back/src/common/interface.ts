export type CertResult = CertSuccess | CertFail;
export interface CertSuccess {
  accessToken?: string;
  userId: string;
  username: string;
  success: true;
}
export interface CertFail {
  success: false;
}
