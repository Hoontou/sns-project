//mongoosejs.com/docs/index.html
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

// use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');`
//if your database has auth enabled

export async function connectMongo() {
  if (!MONGO_URI) {
    throw new Error('missing MONGO_URI');
  }
  await mongoose
    .set('strictQuery', false) //밑의 권고대로 set false 했다.
    .connect(MONGO_URI)
    .then(() => {
      console.log('mongo connected');
    })
    .catch((err) => console.log(err));
}

//(node:176) [MONGOOSE] DeprecationWarning:
//Mongoose: the `strictQuery` option will be switched back to `false` by default in Mongoose 7.
//Use `mongoose.set('strictQuery', false);` if you want to prepare for this change.
//Or use `mongoose.set('strictQuery', true);` to suppress this warning.

export interface UserSchemaType {
  userId: number;
  username: string;
  introduce: string;
  introduceName: string;
  img: string;
}
// user 서버의 user.schema.ts의 코드, ref설정위해 가져왔음
const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  introduce: {
    type: String,
    default: '',
  },
  introduceName: {
    type: String,
    default: '',
  },
  img: {
    type: String,
    default: '',
  },
});
export const userModel = mongoose.model('user', userSchema);

//여기까지-------------------------------------------------
