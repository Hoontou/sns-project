import a1 from '../asset/1.jpg';
import a2 from '../asset/2.jpg';
import a3 from '../asset/3.jpg';
import a4 from '../asset/4.jpg';
import a5 from '../asset/5.jpg';
import a6 from '../asset/6.jpg';
import a7 from '../asset/7.jpg';
import a8 from '../asset/8.jpg';
import a9 from '../asset/9.jpg';
import a10 from '../asset/10.jpg';
import a11 from '../asset/11.jpg';
import a12 from '../asset/12.jpg';
import a13 from '../asset/13.jpg';
import a14 from '../asset/14.jpg';
import a15 from '../asset/15.jpg';
import a16 from '../asset/16.jpg';
import a17 from '../asset/17.jpg';
import a18 from '../asset/18.jpg';
import a19 from '../asset/19.jpg';
import a20 from '../asset/20.jpg';
import a21 from '../asset/21.jpg';
import a22 from '../asset/22.jpg';
import a23 from '../asset/23.jpg';
import a24 from '../asset/24.jpg';
import a25 from '../asset/25.jpg';
import a26 from '../asset/26.jpg';
import a27 from '../asset/27.jpg';
import a28 from '../asset/28.jpg';
import a29 from '../asset/29.png';
import a30 from '../asset/30.png';

const imgList = [
  a1,
  a2,
  a3,
  a4,
  a5,
  a6,
  a7,
  a8,
  a9,
  a10,
  a11,
  a12,
  a13,
  a14,
  a15,
  a16,
  a17,
  a18,
  a19,
  a20,
  a21,
  a22,
  a23,
  a24,
  a25,
  a26,
  a27,
  a28,
  a29,
  a30,
];

class StaticImgServer {
  constructor(private imgList: string[]) {}

  getRandomImgList(howMany: number): string[] {
    if (howMany > 30 || howMany <= 0) {
      throw new Error('not proper howMany');
    }

    const randomNums = Array.from({ length: howMany }, () => {
      return Math.floor(Math.random() * 30) + 1;
    });

    return randomNums.map((i) => {
      return this.imgList[i];
    });
  }

  getRandomImg() {
    return this.imgList[Math.floor(Math.random() * 30) + 1];
  }
}

export const staticImgServer = new StaticImgServer(imgList);
