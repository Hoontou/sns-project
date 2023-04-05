import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { pgClient } from './configs/pg';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'hero',
      protoPath: join(__dirname, 'proto/hero.proto'),
    },
  });
  app.use(cookieParser());
  app.enableCors();
  pgClient.connect((err) => {
    if (err) {
      console.error('vanila pgdb connection error', err.stack);
    } else {
      console.log('vanila pgdb connected');
    }
  });
  //typerom 쿼리빌더 익숙하지 않으면 바닐라로 쿼리 날리려고 연결해놓음.
  //const queryText = `INSERT INTO public.comment(comment, "userId", "postId) VALUES ('${comment}', ${userId}, '${post_id}')`;
  //console.log(queryText);
  //https://node-postgres.com/features/queries
  await app.listen(80);
  console.log(`main-back on 4000:80`);
}
bootstrap();
