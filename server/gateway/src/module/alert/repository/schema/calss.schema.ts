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

@Schema({ collection: 'Rooms' })
export class Room {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Number })
  roomNum: number;
}
export const RoomSchema = SchemaFactory.createForClass(Room);

@Schema({ collection: 'Classes' })
export class Class {
  _id: Types.ObjectId;

  @Prop({ required: true, type: String })
  className: string;

  @Prop({ default: null, type: Types.ObjectId })
  teacher: Types.ObjectId;

  @Prop({ default: [], type: [StudentSchema] })
  students: Types.ObjectId;

  @Prop({ default: null, type: Types.ObjectId, ref: 'Room' })
  room: Room;
}
export const ClassSchema = SchemaFactory.createForClass(Class);

export type ClassDocument = HydratedDocument<Class>;
export type StudentDocument = HydratedDocument<Student>;
export type TeacherDocument = HydratedDocument<Teacher>;
export type RoomDocument = HydratedDocument<Room>;
