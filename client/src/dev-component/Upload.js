import axios from 'axios';
import { ObjectId } from '../common/genobjectid';
import { useState } from 'react';

const Upload = () => {
  const [title, setTitle] = useState('');

  const onTitleHandler = (e) => {
    setTitle(e.currentTarget.value);
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    const userUuid = await axios.get('/main-back/user/hoc').then((res) => {
      return res.data.userUuid;
    }); //나중에 클라이언트 구현시 HOC 실패 방어코드 짜야함.
    //console.log(userUuid);
    const contents = e.target.up.files; //인풋에서 가져와서
    const formData = new FormData();
    const alert_id = ObjectId(); //게시물 업로드중 알람을 위한 uuid
    //인풋에 많이 담아도 네개 까지만 컷한다.
    for (let i = 0; i < 4; i++) {
      formData.append('file', contents[i]);
    }
    //게시글 코멘트와 알람 uuid를 담는다.
    formData.append('title', JSON.stringify({ title }));
    formData.append('alert_id', JSON.stringify({ alert_id }));
    formData.append('userUuid', JSON.stringify({ userUuid }));

    axios //업로드 서버로 보낸다.
      .post('/upload/uploadfiles', formData);
    //이거 파일 보내는동안 페이지를 벗어나면 안되나? 알아봐야함.
    //벗어나도 되면 그냥 알람MSA에 uuid 보내고 페이지 벗어나자.
    //then을 안받아도 되게 느슨한 연결로 만들어 보자.
  };
  return (
    <div>
      <h2>4개보다 많이올려도 네개만 올라감., jpg, mp4, png만 가능</h2>

      <form onSubmit={onSubmit} encType='multipart/form-data'>
        <input
          type='file'
          multiple={true}
          name='up'
          accept='.mp4, .jpg, .png'
        />
        <label>타이틀</label>
        <input onChange={onTitleHandler} />
        <button type='submit'>upload</button>
      </form>
    </div>
  );
};

export default Upload;
