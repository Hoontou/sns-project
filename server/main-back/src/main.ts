import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { pgClient } from './configs/pg';
import { rabbitMQ } from './common/amqp';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  rabbitMQ.initialize();
  await app.listen(80);
}
bootstrap();
