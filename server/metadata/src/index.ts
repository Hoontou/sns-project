import fastify from 'fastify';
import mongoose from 'mongoose';

const server = fastify();
async function connectMongo() {
  await mongoose.connect('mongodb://mgdb:27017/test');
}
const test = async () => {
  const kittySchema = new mongoose.Schema({
    name: String,
  });
  const Kitten = mongoose.model('Kitten', kittySchema);
  const silence = new Kitten({ name: 'Silence' });
  const result = await silence.save();
  console.log(result);
};

connectMongo().catch((err) => console.log(err));
test();

server.listen({ host: '0.0.0.0', port: 4002 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
