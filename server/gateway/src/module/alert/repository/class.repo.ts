import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ClassDocument,
  RoomDocument,
  StudentDocument,
  TeacherDocument,
} from './schema/calss.schema';

@Injectable()
export class AlertCollection {
  constructor(
    @InjectModel('Class')
    public readonly classModel: Model<ClassDocument>,
    @InjectModel('Student')
    public readonly studentModel: Model<StudentDocument>,
    @InjectModel('Teacher')
    public readonly teacherModel: Model<TeacherDocument>,
    @InjectModel('Room')
    public readonly roomModel: Model<RoomDocument>,
  ) {}
}
