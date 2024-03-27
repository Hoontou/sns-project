import { Module } from '@nestjs/common';
import { DirectController } from './direct.controller';
import { DirectService } from './direct.service';
import { ChatRoomSchema } from './repository/schema/chatRoom.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoomCollection } from './repository/chatRoom.collection';
import { MessageManager } from './managers/message.manager';
import { SocketManager } from './managers/socket.manager';
import { UserLocationManager } from './managers/userLocation.manager';
import { ChatRoomManager } from './managers/chatRoom.manager';
import { MessageRepository } from './repository/message.repository';
import { DirectGateway } from './direct.gateway';

//provider의 조직도는, DircetService -> 매니저들 -> repo 순으로.

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'chatroom', schema: ChatRoomSchema }]),
  ],
  providers: [
    DirectGateway,
    DirectService,
    MessageManager,
    SocketManager,
    UserLocationManager,
    ChatRoomManager,
    ChatRoomCollection,
    MessageRepository,
  ],
  controllers: [DirectController],
})
export class DirectModule {}
