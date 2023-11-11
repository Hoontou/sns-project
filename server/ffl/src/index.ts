import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { rabbitMQ } from './common/amqp';
import { connectMongo } from './database/initialize.mongo';
import { crypter } from './common/crypter';
import { ProtoGrpcType } from './proto/ffl';
import { FflServiceHandlers } from './proto/ffl/FflService';
import { cocommentLikeRopository } from './database/repository/cocomment.like.repo';
import { commentLikeRopository } from './database/repository/comment.like.repo';
import { followRepository } from './database/repository/follow.repo';
import { likeRopository } from './database/repository/like.repo';

const PORT = 80;
const packageDef = protoLoader.loadSync(join(__dirname, './proto/ffl.proto'), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const grpcObj = grpc.loadPackageDefinition(
  packageDef,
) as unknown as ProtoGrpcType;
const fflPackage = grpcObj.ffl;

const main = () => {
  const server = getServer();

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    async (err, port) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`ffl on 4003:${port}`);

      connectMongo();
      rabbitMQ.initialize('ffl');
      server.start();
    },
  );
};
const getServer = () => {
  const server = new grpc.Server();
  server.addService(fflPackage.FflService.service, {
    CheckFollowed: async (req, res) => {
      //myId가 userId를 팔로우했는지 가져와야함.
      //userFrom: myId, userTo: userId
      const decUserTo = crypter.decrypt(req.request.userTo);
      const decUserFrom = crypter.decrypt(req.request.userFrom);

      const followed: unknown[] = await followRepository.db.find({
        userTo: decUserTo,
        userFrom: decUserFrom,
      });

      //팔로우 찾은게 없으면 false 있으면 true
      res(null, { followed: followed.length === 0 ? false : true });
      return;
    },
    CheckLiked: async (req, res) => {
      //userId, postId
      //userId가 postId에 좋아요 눌렀는지 가져와야함.
      const decUserId = crypter.decrypt(req.request.userId);
      const liked: unknown[] = await likeRopository.db.find({
        userId: decUserId,
        postId: req.request.postId,
      });

      res(null, { liked: liked.length === 0 ? false : true });
      return;
    },
    GetUserIds: async (req, res) => {
      //좋아요 누른 사람들 or 팔로우 한 사람들 or 팔로잉 하는 사람들
      if (req.request.type === 'like') {
        res(null, {
          userIds: await likeRopository.getUserIds(
            req.request.id,
            req.request.page,
          ),
        });
        return;
      }

      res(null, {
        userIds: await followRepository.getUserIds(
          crypter.decrypt(req.request.id),
          req.request.type as 'follower' | 'following',
          req.request.page,
        ),
      });
      return;
    },
    GetCommentLiked: async (req, res) => {
      //각각의 댓글에 좋아요 눌렀는지 체크
      const likedList = await commentLikeRopository.db
        .find({
          commentId: { $in: req.request.commentIdList },
          userId: `${crypter.decrypt(req.request.userId)}`,
        })
        .exec();

      //false를 갯수만큼 채우고
      const commentLikedList = Array(req.request.commentIdList.length).fill(
        false,
      );

      //item이 존재한다면 true로 변경
      for (const i of likedList) {
        commentLikedList[req.request.commentIdList.indexOf(i.commentId)] = true;
      }

      res(null, {
        commentLikedList,
      });
      return;
    },
    GetCocommentLiked: async (req, res) => {
      const likedList = await cocommentLikeRopository.db
        .find({
          cocommentId: { $in: req.request.cocommentIdList },
          userId: `${crypter.decrypt(req.request.userId)}`,
        })
        .exec();

      const cocommentLikedList = Array(req.request.cocommentIdList.length).fill(
        false,
      );
      for (const i of likedList) {
        cocommentLikedList[req.request.cocommentIdList.indexOf(i.cocommentId)] =
          true;
      }

      res(null, { cocommentLikedList });
      return;
    },
    SearchUserFfl: async (req, res) => {
      console.log(req.request);
      //타입이 팔로우일 경우 암호회 된 userId가 타겟으로 온다.
      //좋아요일 경우 objId로 된 postId가 온다.
      //요청온 타입에 맞게 검색요청
      const selectAndRequestSearching = (type) => {
        if (type === 'follower') {
          return followRepository.searchUserFollower({
            targetUser: req.request.target,
            searchString: req.request.searchString,
          });
        }
        if (type === 'following') {
          return followRepository.searchUserFollowing({
            targetUser: req.request.target,
            searchString: req.request.searchString,
          });
        }
        return likeRopository.searchUserLike({
          targetPostId: req.request.target,
          searchString: req.request.searchString,
        });
      };

      const searchedUserList: {
        username: string;
        userId: number;
        introduceName: string;
        img: string;
      }[] = await selectAndRequestSearching(req.request.type);

      res(null, { userList: searchedUserList });
      return;
    },
  } as FflServiceHandlers);
  return server;
};

main();
