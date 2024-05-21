import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Class,
  ClassDocument,
  RoomDocument,
  Teacher,
} from './schema/calss.schema';

@Injectable()
export class ClassCollection {
  constructor(
    @InjectModel('Class')
    public readonly classModel: Model<ClassDocument>,
    @InjectModel('Room')
    public readonly roomModel: Model<RoomDocument>,
  ) {
    this.tstPopulate();
  }

  //이게 참 이상한게, class정의 에서는 컬렉션 이름을 내가 지정한대로 들어가고,
  //모듈에서 스키마 주입을 위해 name을 내가그냥 Room으로 넣어버려도
  //populate하기 위해서는 소문자 room으로 아래와 같이 해야한다.
  //아니면 오류를 뱉어버림. 어쨋든, 어떻게 해야하는지 알아냈으니 개굿.
  async tstPopulate() {
    const cl = await this.classModel
      .findOne({
        _id: '664c6edb41550a21dc36d9b3',
      })
      .populate('room');

    console.log(cl);
  }

  //Partial사용해서 삽입에 필요한 필드만 선언해서 insert가능.
  async tstEmbededInsert() {
    const teacher: Teacher = {
      name: '강감찬',
    };

    const classForm: Partial<Class> = {
      className: '영어',
      teacher,
    };

    const newClass = new this.classModel(classForm);
    newClass.save();
  }

  async tstLateRefInsert() {
    const cl = await this.classModel.findOne({
      _id: '664c6edb41550a21dc36d9b3',
    });
    console.log(cl);

    // const room = new this.roomModel({
    //   roomNum: 2,
    // });

    // await room.save();

    //ref로 insert하는건, Class class정의에서
    //room 필드를 타입 _id로 하는게 편한듯.
    //room 필드를 Room타입으로 지정하면 아예 Room을 가져와서 넣어야함.
    //몽고디비에서 알아서 _id만 빼내서 저장하지만,
    //타입스크립트는 그딴거 모르고 타입 안맞다고 뱉어버림.
    //당연히 TS가 그렇게 뱉는게 맞는거긴한데 ㅋㅋ
    // if (cl && room) {
    //   cl.room = room._id;
    //   cl.save();
    // }

    //아래처럼 그냥 쌩으로 바로 지정해서 저장해도 되고,
    //아니면 안전하게 find로 가져와서 _id를 넣어도 됨.
    if (cl) {
      cl.room = new Types.ObjectId('664c6e1f88cb38e1da992aa7');
      cl.save();
    }
  }
}
