import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  ChatRoomSchemaDefinition,
  ChatRoomSchemaType,
} from './schema/chatRoom.schema';
import { pgdb } from '../../../configs/postgres';

@Injectable()
export class ChatRoomCollection {
  private readonly pgClient;
  constructor(
    @InjectModel('chatroom')
    public readonly chatRoomModel: Model<ChatRoomSchemaDefinition>,
  ) {
    this.pgClient = pgdb.client;
  }

  async getChatRoomByUserIds(data: {
    ownerUserId: number;
    chatWithUserId: number;
  }) {
    return this.chatRoomModel.findOne({
      ownerUserId: data.ownerUserId,
      chatWithUserId: data.chatWithUserId,
    });
  }
  async getChatRoomByRoomId(data: { ownerUserId: number; chatRoomId: number }) {
    const chatRoom: unknown = await this.chatRoomModel
      .findOne({
        ownerUserId: data.ownerUserId,
        chatRoomId: data.chatRoomId,
      })
      .populate('userPop')
      .exec();
    return chatRoom as ChatRoomSchemaType;
  }

  async createChatRoom(data: {
    ownerUserId: number;
    chatWithUserId: number;
  }): Promise<number> {
    const insertResult = await this.pgClient.query(
      'INSERT INTO chatrooms DEFAULT VALUES RETURNING *;',
    );

    const newChatRoomId = insertResult.rows[0].id;

    await this.chatRoomModel.create([
      {
        chatRoomId: newChatRoomId,
        ownerUserId: data.ownerUserId,
        chatWithUserId: data.chatWithUserId,
      },
      {
        chatRoomId: newChatRoomId,
        ownerUserId: data.chatWithUserId,
        chatWithUserId: data.ownerUserId,
      },
    ]);

    return newChatRoomId;
  }

  async updateChatRoomAndReturn(data: {
    chatRoom: ChatRoomSchemaType;
    messageForm: { messageType: 'text' | 'photo'; content: string };
    isRead: boolean;
  }) {
    const lastUpdatedAt = Date.now();
    //내 챗룸에서
    //마지막말, 마지막 업데이트, 토탈 챗 갯수
    //상대 챗룸에서
    //마지막말, 마지막 업데이트, 토탈 챗 갯수, 안읽은 챗 갯수
    //만약 상대는 챗룸에서 나갔다면? 새로 챗룸만들어야함, 아직은 추가안했음
    //챗룸나가기 구현 하면서 만들기

    const [myChatRoom, friendsChatRoom] = await Promise.all([
      this.chatRoomModel
        .findOneAndUpdate(
          {
            _id: data.chatRoom._id,
          },
          {
            lastTalk:
              data.messageForm.messageType === 'photo'
                ? '사진'
                : data.messageForm.content,
            //몽고디비 자체 함수가있는데 몽고디비랑 서버랑 시간이 안맞을수도 있어서
            lastUpdatedAt,
            $inc: { totalChatCount: 1 },
          },
          { new: true },
        )
        .exec(),
      this.chatRoomModel
        .findOneAndUpdate(
          {
            ownerUserId: data.chatRoom.chatWithUserId,
            chatWithUserId: data.chatRoom.ownerUserId,
          },
          {
            lastTalk:
              data.messageForm.messageType === 'photo'
                ? '사진'
                : data.messageForm.content,
            //몽고디비 자체 함수가있는데 몽고디비랑 서버랑 시간이 안맞을수도 있어서
            lastUpdatedAt,
            $inc: {
              newChatCount: data.isRead === true ? 0 : 1,
              totalChatCount: 1,
            },
          },
          { new: true },
        )
        .populate('userPop')
        .exec(),
    ]);
    return { myChatRoom, friendsChatRoom };
  }

  getChatRoomsByUserIdWithUserPop(userId: number, page: number) {
    const size = 12;
    return this.chatRoomModel
      .find({ ownerUserId: userId })
      .populate('userPop')
      .sort({ lastUpdatedAt: -1 })
      .skip(page * size)
      .limit(size)
      .exec();
  }

  readMessages(chatRoom: ChatRoomSchemaType) {
    this.chatRoomModel
      .findOneAndUpdate(
        {
          _id: chatRoom._id,
        },
        {
          newChatCount: 0,
        },
      )
      .exec();
  }

  async getLastUpdatedChatRoom(
    userId: number,
  ): Promise<ChatRoomSchemaType | null> {
    return this.chatRoomModel
      .findOne({ ownerUserId: userId })
      .sort({ lastUpdatedAt: -1 })
      .limit(1)
      .exec() as any;
  }
}
