import axios from 'axios';

const Upload = () => {
  const onSubmit = async (e) => {
    e.preventDefault();
    const contents = e.target.up.files; //인풋에서 가져와서
    const formData = new FormData();
    // formData에 루프돌려서 담은 뒤
    // for (const f of contents) {
    //   formData.append('file', f); //file이 서버에서 받을 키값. 맞춰줘야지 받는다.
    // }

    //네개 까지만 컷하고
    for (let i = 0; i < 4; i++) {
      formData.append('file', contents[i]);
    }
    axios //업로드 서버로 보낸다.
      .post('/upload/uploadfiles', formData)
      .then((res) => {
        // const { fileName } = res.data;
        // console.log(fileName);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  return (
    <>
      <h2>4개까지만 올라감., jpg, mp4, png</h2>

      <form onSubmit={onSubmit} encType='multipart/form-data'>
        <input
          type='file'
          multiple={true}
          name='up'
          accept='.mp4, .jpg, .png'
        />
        <button type='submit'>upload</button>
      </form>
    </>
  );
};

export default Upload;
