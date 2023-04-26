import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { pgClient } from './configs/pg';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const authGrpc = await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:80',
      package: 'auth',
      protoPath: join(__dirname, 'proto/auth.proto'),
    },
  });
  const userGrpc = await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:81',
      package: 'user',
      protoPath: join(__dirname, 'proto/user.proto'),
    },
  });

  //https://docs.nestjs.com/faq/hybrid-application
  // const microserviceGrp = app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.GRPC,
  //   options: {
  //     package: 'hero',
  //     protoPath: join(__dirname, 'proto/hero.proto'),
  //   },
  // });

  //typerom 쿼리빌더 익숙하지 않으면 바닐라로 쿼리 날리려고 연결해놓음.
  //const queryText = `INSERT INTO public.comment(comment, "userId", "postId) VALUES ('${comment}', ${userId}, '${post_id}')`;
  //console.log(queryText);
  //https://node-postgres.com/features/queries
  await app.startAllMicroservices();
  app.listen(3000).then(() => {
    logger.log('user on 4001:80 (grpc server)');
    pgClient.connect((err) => {
      if (err) {
        logger.error('vanila pgdb connection error', err.stack);
      } else {
        logger.log('vanila pgdb connected');
      }
    });
  });
}
bootstrap();
