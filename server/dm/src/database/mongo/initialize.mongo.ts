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
    .then(() => console.log('mongo connected'))
    .catch((err) => console.log(err));
}

//(node:176) [MONGOOSE] DeprecationWarning:
//Mongoose: the `strictQuery` option will be switched back to `false` by default in Mongoose 7.
//Use `mongoose.set('strictQuery', false);` if you want to prepare for this change.
//Or use `mongoose.set('strictQuery', true);` to suppress this warning.
