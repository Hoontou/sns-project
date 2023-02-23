//mongoosejs.com/docs/index.html

import mongoose from 'mongoose';

// use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');`
//if your database has auth enabled
export async function connectMongo() {
  await mongoose
    .set('strictQuery', false) //밑의 권고대로 set false 했다.
    .connect('mongodb://mgdb:27017/test')
    .then(() => console.log('DB connected'))
    .catch((err) => console.log(err));
}
//(node:176) [MONGOOSE] DeprecationWarning:
//Mongoose: the `strictQuery` option will be switched back to `false` by default in Mongoose 7.
//Use `mongoose.set('strictQuery', false);` if you want to prepare for this change.
//Or use `mongoose.set('strictQuery', true);` to suppress this warning.
