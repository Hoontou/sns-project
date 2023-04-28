import mongoose from 'mongoose';

const PostLikesSchema = new mongoose.Schema({
  userFrom: String,
  postTo: String,
});

const FollowSchema = new mongoose.Schema({
  userForm: String,
  userTo: String,
});

export const Follow = mongoose.model('follow', FollowSchema);

//Dto파싱해서 document로 만들어 저장까지 해주는 함수.
export const newFollow = (data: { userTo: string; userFrom: string }) => {
  const newOne = new Follow(data);
  newOne
    .save()
    .then(() => console.log('follow stored in mongo successfully'))
    .catch(() => console.log('err when storing follow in mongo'));
  //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
  return newOne;
};
