import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Hero } from 'src/proto/hero/Hero';
import { HeroById } from 'src/proto/hero/HeroById';

@Controller('hero')
export class HeroController {
  //https://docs.nestjs.com/microservices/grpc
  //데코레이터에 두번째 인자가 없으면, 아래 메서드를
  //upper camel case로 변경해서 자동으로 매칭시켜준단다.
  //아예 인자가 전달안돼면 클래스명으로 매칭한다.
  //hero.proto에 정의된 service 이름이 HeroService니까
  //인자 안줄꺼면 클래스이름을 HeroController 말고 HeroService로 해야 매칭된다.
  @GrpcMethod('HeroesService')
  findOne(
    data: HeroById,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>,
  ): Hero | false {
    const items: Hero[] = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];

    const item = items.find(({ id }) => id === data.id);
    return item !== undefined ? item : false;
  }
}
