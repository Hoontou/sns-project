const ChangeIntro = () => {
  return (
    <>
      <TextField
        sx={{ m: 1, width: '30ch' }}
        label='Introduce'
        variant='standard'
        multiline
        rows={4}
        onChange={onIntroHandler}
        value={intro}
      />{' '}
      <div>
        <p>소개글. 최대 50자, 3줄까지 입력가능</p>
        <div>
          <Button
            variant='outlined'
            size='medium'
            onClick={() => {
              setIntro('');
            }}
          >
            칸비우기
          </Button>
          <Button variant='outlined' size='medium' onClick={submitIntro}>
            수정하기
          </Button>
        </div>
      </div>
    </>
  );
};
export default ChangeIntro;
