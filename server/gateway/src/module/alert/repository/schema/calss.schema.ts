import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

//클래스
//이름
//선생
//학생들
//교실 (ref)

//학생

//선생

//교실

@Schema()
export class Teacher {
  @Prop({ required: true, type: String })
  name: string;
}
export const TeacherSchema = SchemaFactory.createForClass(Teacher);

@Schema()
export class Student {
  @Prop({ required: true, type: String })
  name: string;
}
export const StudentSchema = SchemaFactory.createForClass(Student);

//아래 컬렉션 이름 지정을 Rooms로 하고
//모듈에서 주입을 위한 name필드는 Room으로 하고
//populate하는 곳에서는 'room'으로 소문자, 복수형 떼서 해라.
//다르게 하면 오류뱉는다.

@Schema({ collection: 'Rooms' })
export class Room {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, type: Number })
  roomNum: number;
}
export const RoomSchema = SchemaFactory.createForClass(Room);

@Schema({ collection: 'Classes' })
export class Class {
  _id: Types.ObjectId;

  @Prop({ required: true, type: String })
  className: string;

  //임베디드
  @Prop({ default: null, type: TeacherSchema })
  teacher: Teacher;

  @Prop({ default: [], type: [StudentSchema] })
  students: Student;

  //참조
  @Prop({ default: null, type: Types.ObjectId, ref: 'Room' })
  room: Types.ObjectId;
}
export const ClassSchema = SchemaFactory.createForClass(Class);

export type ClassDocument = HydratedDocument<Class>;
export type StudentDocument = HydratedDocument<Student>;
export type TeacherDocument = HydratedDocument<Teacher>;
export type RoomDocument = HydratedDocument<Room>;
