import { remove as fsRemove } from 'fs-extra'; //fs보다 진화된? 라이브러리, remove는 async방식임.

class RmDirer {
  private count: number;
  constructor() {
    this.count = 0;
  }

  counter(): void {
    this.count += 1;
    if (this.count >= 5) {
      this.rm();
      this.count = 0;
    }
  }
  private rm(): void {
    fsRemove(`./files`, () => {
      console.log('Folder Deleted');
    });
    //mkdirSync(`./files`, { recursive: true });
    //이거는 업로드 미들웨어에서 이미 리컬시브로 하고있어서 없어도 되겠다.
  }
}
export const rmDirer = new RmDirer();

// fsRemove(`./files/${post_id}`, () => {
//   console.log('Folder Deleted');
// }); 이거를 uploadfiles 라우터에 붙여넣으면 한번 업로드 요청 마다 바로바로 삭제함.
