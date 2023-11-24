import mongoose from 'mongoose';
import { AlertDto } from 'sns-interfaces/alert.interface';

const alertSchema = new mongoose.Schema({
  _id: String,
  userId: String,
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
  constructor(public readonly db) {}

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  saveAlert(alertDto: AlertDto) {
    const newOne = new Alert(alertDto);

    newOne
      .save()
      .then(() => console.log('alert stored in mongo successfully'))
      .catch(() => {
        console.log('err when storing alert in mongo');
      });
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
    return newOne;
  }
}
export const alertRepository = new AlertRepository(Alert);
