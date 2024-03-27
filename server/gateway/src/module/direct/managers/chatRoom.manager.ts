import { crypter } from 'src/common/crypter';
import { ChatRoomCollection } from '../repository/chatRoom.collection';
import {
  ChatRoomSchemaType,
  emptyChatRoom,
} from '../repository/schema/chatRoom.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatRoomManager {
  constructor(private readonly chatRoomCollection: ChatRoomCollection) {}

  async requestChatRoomId(data: {
    userId: string;
    chatTargetUserId: string;
  }): Promise<{ chatRoomId: number }> {
    const ownerUserId = Number(crypter.decrypt(data.userId));
    const chatWithUserId = Number(crypter.decrypt(data.chatTargetUserId));

    const chatRoom = await this.chatRoomCollection.getChatRoomByUserIds({
      ownerUserId,
      chatWithUserId,
    });

    if (chatRoom !== null) {
      return { chatRoomId: chatRoom.chatRoomId };
    }

    const chatRoomId = await this.chatRoomCollection.createChatRoom({
      ownerUserId,
      chatWithUserId,
    });
    return { chatRoomId };
  }

  async checkChatRoomOwner(data: {
    chatRoomId: number;
    userId: number;
  }): Promise<{
    ownerCheckResult: boolean;
    chatRoom: ChatRoomSchemaType;
  }> {
    const chatRoom = await this.chatRoomCollection.getChatRoomByRoomId({
      ownerUserId: data.userId,
      chatRoomId: data.chatRoomId,
    });

    if (chatRoom === null) {
      return { ownerCheckResult: false, chatRoom: emptyChatRoom };
    }
    return { ownerCheckResult: true, chatRoom };
  }

  async updateChatRoom(data: {
    chatRoom: ChatRoomSchemaType;
    messageForm: { messageType: 'text' | 'photo'; content: string };
    isRead: boolean;
  }) {
    const result: {
      myChatRoom;
      friendsChatRoom;
    } = await this.chatRoomCollection.updateChatRoomAndReturn(data);

    const parsedChatRoom = {
      _id: result.friendsChatRoom?._id,
      chatRoomId: result.friendsChatRoom?.chatRoomId,
      lastTalk: result.friendsChatRoom?.lastTalk,
      lastUpdatedAt: result.friendsChatRoom?.lastUpdatedAt,
      newChatCount: result.friendsChatRoom?.newChatCount,
      totalChatCount: result.friendsChatRoom?.totalChatCount,
      chatWithUserInfo: {
        ...result.friendsChatRoom?.userPop._doc,
        userId: undefined,
      },
    };
    return { myChatRoom: result.myChatRoom, friendsChatRoom: parsedChatRoom };
  }

  async getMyChatRooms(userId: number, page: number) {
    const chatRooms: { [key: string]: any }[] =
      await this.chatRoomCollection.getChatRoomsByUserIdWithUserPop(
        userId,
        page,
      );

    //pop해온 정보 풀어서 넣고 리턴
    const tmp = chatRooms.map((i) => {
      delete i._doc.ownerUserId;
      delete i._doc.chatWithUserId;

      return {
        ...i._doc,
        chatWithUserInfo: { ...i.userPop._doc, userId: undefined },
      };
    });

    return tmp;
  }

  readMessages(chatRoom: ChatRoomSchemaType) {
    return this.chatRoomCollection.readMessages(chatRoom);
  }

  async checkHasNewMessage(userId: number) {
    const lastUpdatedChatRoom =
      await this.chatRoomCollection.getLastUpdatedChatRoom(userId);

    if (lastUpdatedChatRoom === null) {
      return false;
    }

    if (lastUpdatedChatRoom.newChatCount > 0) {
      return true;
    }

    return false;
  }
}
