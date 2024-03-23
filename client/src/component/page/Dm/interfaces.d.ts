export interface ChatRoomDocType {
  _id?: string;
  chatRoomId: number;
  lastTalk: string;
  lastUpdatedAt: string;
  newChatCount: number;
  totalChatCount: number;
}

export const emptyChatRoom: ChatRoomDocType = {
  chatRoomId: 0,
  lastTalk: '',
  lastUpdatedAt: '',
  ownerUserId: 0,
  chatWithUserId: 0,
  newChatCount: 0,
  totalChatCount: 0,
};

export interface ChatRoomWithUserPop extends ChatRoomDocType {
  chatWithUserInfo: {
    _id: string;
    userId: undefined;
    username: string;
    introduce: string;
    introduceName: string;
    img: string;
  };
}

export interface DirectUserInfo {
  userId: number;
  username: string;
  introduce: string;
  introduceName: string;
  img: string;
}

export interface DirectMessage {
  id: number;
  chatRoomId: number;
  isMyChat: boolean;
  messageType: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}
