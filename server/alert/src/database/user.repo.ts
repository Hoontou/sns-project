import mongoose from 'mongoose';
// user 서버의 user.schema.ts의 코드, ref설정위해 가져왔음
const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  introduce: {
    type: String,
    default: '',
  },
  introduceName: {
    type: String,
    default: '',
  },
  img: {
    type: String,
    default: '',
  },
});

export interface UserSchemaType {
  userId: number;
  username: string;
  introduce: string;
  introduceName: string;
  img: string;
}

//여기까지-------------------------------------------------

/**원래 여기서 이거쓰면 마음에 안드는데, 효율적으로 하기위해.., find메서드만 사용한다. */
const UserModel = mongoose.model('user', userSchema);

export class UserRepository {
  constructor(
    public readonly db: mongoose.Model<{
      userId: number;
      username: string;
      introduce: string;
      introduceName: string;
      img: string;
    }>,
  ) {}

  async findUserIdsByUsernames(usernames: string[]): Promise<number[]> {
    const result = await this.db.find({
      username: { $in: usernames },
    });

    const userIds = result.map((item) => {
      return item.userId;
    });

    return userIds;
  }
}
export const userRepository = new UserRepository(UserModel);
