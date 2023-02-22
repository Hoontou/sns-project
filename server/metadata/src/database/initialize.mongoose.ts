//mongoosejs.com/docs/index.html

import mongoose from 'mongoose';

export async function connectMongo() {
  await mongoose.connect('mongodb://mgdb:27017/test');
}
