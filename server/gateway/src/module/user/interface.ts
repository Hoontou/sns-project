/**내 정보로 접근시 userId가 내 아이디, 상대정보로 접근시 myId가 내 아이디임. */
export type UserInfoBody = MyInfoData | UserInfoData;
interface MyInfoData {
  type: 'myInfo';
  userId: string;
}
interface UserInfoData {
  type: 'otherInfo';
  targetUsername: string;
  myId: string;
}
