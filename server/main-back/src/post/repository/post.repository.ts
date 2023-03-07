import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Post } from '../entity/post.entity';
import { PostDto } from '../dto/post.dto';
import { UsernumsTable } from '../../user/repository/usernums.repository';

@Injectable()
export class PostTable {
  constructor(
    @InjectRepository(Post)
    public db: Repository<Post>,
    private usernumsTable: UsernumsTable,
  ) {}

  async addPost(postDto: PostDto) {
    const { post_id, userId } = postDto;
    await this.db
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values({
        id: post_id,
        user: () => `${userId}`,
      })
      .execute();
    await this.usernumsTable.addPost(userId);

    return { success: true };
  }
}

//이미 있는 row에서 userUuid만 바꿔서 리퀘스트 날리면 useruuid가 업데이트된다.
//완벽한 동작을 위해선 insert쿼리 자체를 날리거나 이미 post_id가 존재하는지 체크해야함.
//근데 쿼리 자체를날리면 userId로 유저 찾아오고 등등 귀찮은 작업 필요없이 그냥
//userId: userUuid, id: postId해서 넣기만 하면 될텐데...
//불필요한 비용도 안나올거임.
//쿼리빌더 쓰면 되나?

//쿼리빌더 써보기 전 코드.
// const user = await this.userTable.db.findOne({
//   where: { id: postDto.userId },
// });
// if (!user) {
//   //hoc를 거치고 거기서 리턴받은 useruuid이므로 오류가 날리는 없음.
//   throw new NotFoundException();
// }
// const postForm = {
//   id: postDto.post_id,
//   user,
// };
// const newPost: Post = this.postTable.db.create(postForm);
// this.postTable.db.save(newPost);

//쿼리빌더 코드
//const { post_id, userId } = postDto;
//await this.postTable.db
// .createQueryBuilder()
// .insert()
// .into(Post)
// .values({
//   id: post_id,
//   user: () => `${userId}`,
// })
// .execute()
//근데 uuid를 ()=>으로 파싱하는데 pgdb에서 useruuid를 받아들이지 못하는것 같다.
//그냥 integer id를 쓸까? 쿼리빌더쓰면 pg에서 뱉는 오류를 그대로 볼 수 있긴한데
//오류가 발생할 수 없게 설계하면 쿼리빌더가 필요없을것 같긴하고.
//근데 또 쿼리빌더쓰면 user찾는 1개의 쿼리를 아낄수있긴한데..
