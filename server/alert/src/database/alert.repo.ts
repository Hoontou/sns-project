import mongoose from 'mongoose';
import { AlertDto } from 'sns-interfaces/alert.interface';

interface AlertDocType {
  userId: number;
  content: {
    userId: number;
    userIds?: number[];
    [key: string]: any;
  };
}
const alertSchema = new mongoose.Schema({
  userId: Number,
  content: Object,
  createdAt: {
    type: Date,
    default: Date.now, // 현재 날짜 및 시간으로 기본값 설정
  },
});
alertSchema.index({
  userId: 1,
});

const Alert = mongoose.model('alert', alertSchema);

class AlertRepository {
  //  constructor(public readonly db) {connectMongo();}
  //스키마 다중연결을 고려해서 몽고연결은 index.ts에서
  constructor(public readonly db) {
    //다중필드에서 중첩객체 검색하는법
    //저장할 때 처럼 content: {type} 이렇게 하는거 아님
    // this.db
    //   .find({
    //     userId: 7,
    //     'content.type': 'like',
    //   })
    //   .then((res) => {
    //     console.log(res);
    //   });
  }

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  saveAlert(alertDto: AlertDto) {
    const newOne = new Alert({
      userId: alertDto.userId,
      content: alertDto.content,
    });
    console.log(typeof alertDto.userId);

    newOne
      .save()
      .then(() => console.log('alert stored in mongo successfully'))
      .catch((err) => {
        console.log('err when storing alert in mongo');
        console.log(err);
      });
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
    return newOne;
  }
}
export const alertRepository = new AlertRepository(Alert);
