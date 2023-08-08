import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';
import { LoggingInterceptor } from './common/middleware/logging.interceptor';
import { AllExceptionsFilter } from './common/middleware/all-exceptions.filter';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //https://docs.nestjs.com/faq/hybrid-application
  // const microserviceGrp = app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.GRPC,
  //   options: {
  //     package: 'hero',
  //     protoPath: join(__dirname, 'proto/hero.proto'),
  //   },
  // });

  app.use(cookieParser());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors();
  //typerom 쿼리빌더 익숙하지 않으면 바닐라로 쿼리 날리려고 연결해놓음.
  //const queryText = `INSERT INTO public.comment(comment, "userId", "postId) VALUES ('${comment}', ${userId}, '${post_id}')`;
  //console.log(queryText);
  //https://node-postgres.com/features/queries
  await app.listen(80);
  logger.log(`gateway on 4000:80`);
}
bootstrap();
