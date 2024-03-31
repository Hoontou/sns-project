import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { method, path: url } = req;
    const now = Date.now();
    const ipAddress =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    this.logger.log(
      `${method} ${url}: ${context.getClass().name} ${
        context.getHandler().name
      }`,
    );

    return next.handle().pipe(
      tap((res) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        this.logger.log(
          `${ipAddress} ${method} ${url} ${statusCode}: ${Date.now() - now}ms`,
        );

        this.logger.debug('Response:', res);
      }),
    );
  }
}

// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
//   Logger,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';

// @Injectable()
// export class LoggingInterceptor implements NestInterceptor {
//   private readonly logger = new Logger(LoggingInterceptor.name);

//   intercept(
//     context: ExecutionContext,
//     next: CallHandler,
//   ): Observable<any> | Promise<Observable<any>> {
//     const req = context.switchToHttp().getRequest();
//     const userAgent = req.get('user-agent') || '';
//     const { ip, method, path: url } = req;
//     const now = Date.now();

//     this.logger.log(
//       `${method} ${url} ${userAgent} ${ip}: ${context.getClass().name} ${
//         context.getHandler().name
//       }`,
//     );

//     return next.handle().pipe(
//       tap((res) => {
//         const response = context.switchToHttp().getResponse();
//         const { statusCode } = response;
//         this.logger.log(
//           `${method} ${url} ${statusCode}: ${Date.now() - now}ms`,
//         );

//         this.logger.debug('Response:', res);
//       }),
//     );
//   }
// }
