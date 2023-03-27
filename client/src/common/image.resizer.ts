import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: undefined, //(default: undefined)
  useWebWorker: true,
};
//최대 파일사이즈 1로, 클라이언트가 리사이징 수행. 시간걸림.
export const resizer = async (imageList: File[]) => {
  try {
    const list = await Promise.all(
      imageList.map((i) => {
        return imageCompression(i, options);
      })
    );
    return list;
  } catch {
    return false;
  }
};
