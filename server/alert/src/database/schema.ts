import mongoose from 'mongoose';
import { AlertDto } from 'src/common/interface';

const alertSchema = new mongoose.Schema({
  _id: String,
  userId: String,
  type: String,
  content: Object,
});

const Alert = mongoose.model('alert', alertSchema);

//Dto파싱해서 document로 만들어 저장까지 해주는 함수.
export const newAlert = (alertDto: AlertDto) => {
  const newOne = new Alert(alertDto);

  newOne
    .save()
    .then(() => console.log('alert stored in mongo successfully'))
    .catch(() => {
      console.log('err when storing alert in mongo');
    });
  //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
  return newOne;
};
