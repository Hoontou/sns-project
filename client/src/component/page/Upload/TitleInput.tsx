import { TextField } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { titleLen } from './Upload';

const TitleInput = (props: {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setSearchRequestString: React.Dispatch<React.SetStateAction<string>>;
  clickedTag: string;
  setSearchbarDisplay: React.Dispatch<React.SetStateAction<boolean>>;

  connectSocket: () => void;
}) => {
  // const [tags, setTags] = useState<string[]>([]);
  // const [searchResult, setSearchResult] = useState<string[]>([]);
  // const [tagSearchUnderBarDisplay, TagsearchUnderBarDisplay] =
  //   useState<boolean>(false);
  const [socketConnected, setConnected] = useState<boolean>(false);
  const [targetTagIndex, setTargetTagIndex] = useState<number>(0);

  const onTitleHandler = (e: ChangeEvent<HTMLInputElement>) => {
    //새로입력받은 타이틀과 저장돼있던 타이틀 비교한 후 타이틀 갈아끼우기
    const diff = checkHashtagDiff(props.title, e.target.value);
    props.setTitle(e.target.value);

    //해시태그 추출

    // const tmp = splitTitle(e.target.value);
    // 이거 필요한가? 안필요할듯
    // 입력받은 값에 태그가 없으면 빈리스트로 갈아끼우고 리턴
    // if (tmp.length === 0) {
    //   props.setSearchbarDisplay(false);
    //   setTags([]);
    //   return;
    // }

    //태그 있으면 실시간 검색을 위해 변경된 태그를 찾는다
    console.log('변경점?', diff);

    if (diff === undefined || diff.changedTag === undefined) {
      //태그수정을 안했거나, 태그를 없앤경우 그냥 상태만 저장 후 리턴
      props.setSearchbarDisplay(false);
      // setTags(tmp);
      return;
    }

    //여기까지 왔으면 태그변경 했다.
    //변경된 태그를 웹소켓에 날려서 결과를 가져온 후 태그서치언더바를 띄워서 디스플레이 한다.
    //1. 먼저 웹소켓 연결
    if (socketConnected === false) {
      //소켓연결 함수호출 후 상태저장
      props.connectSocket();
      setConnected(true);
    }
    //2. 검색할 단어 부모에게 전달, 부모에서 useEffect써서 변경감지 시 소켓에 검색날림
    props.setSearchRequestString(diff.changedTag);

    //태그서치언더바의 content를 클릭하면 변경중이었던 태그를 수정해야함.

    //상태저장
    // setTags(tmp);
    return;
  };

  /**기존 리스트, 수정된 리스트 받아와서 어떤게 수정됐는지 리턴*/
  const checkHashtagDiff = (
    original: string,
    tmp: string
  ): { changedTag: string | undefined } | undefined => {
    const splitedOriginal = splitTitle(original);
    const splitedTmp = splitTitle(tmp);
    console.log(splitedOriginal);
    console.log(splitedTmp);

    //해시태그 삭제한 경우, 수정한 경우, 수정이 없는경우
    //1. 두개의 길이가 다르면, 바로그냥 리턴 -> 삭제한경우, 막 추가한 경우
    if (splitedTmp.length !== splitedOriginal.length) {
      console.log(false);
      props.setSearchbarDisplay(false);
      return undefined;
    }

    //2. 수정한 경우, 보통 맨뒤를 수정한다고 가정하고 맨뒤부터 탐색
    let tmpIndex = splitedTmp.length - 1;

    while (tmpIndex > -1) {
      //현재 인덱스의 item이 태그라면,
      if (
        splitedTmp.at(tmpIndex)?.startsWith('@') ||
        splitedTmp.at(tmpIndex)?.startsWith('#')
      ) {
        //변경포인트 발견시 리턴
        if (
          splitedOriginal.at(tmpIndex) !== splitedTmp.at(tmpIndex) &&
          splitedOriginal.at(tmpIndex) !== undefined
        ) {
          setTargetTagIndex(tmpIndex);

          return { changedTag: splitedTmp.at(tmpIndex) };
        }
      }

      //변경점 감지 못했으면 인덱스 감소
      tmpIndex -= 1;
    }

    //여기까지 왔으면 태그수정을 안한경우
    return undefined;
  };

  /**정규 표현식을 사용하여 #으로 시작하는 단어를 추출 */
  const splitTitle = (text: string) => {
    const splitedTitle = text
      .split(/(#\S+|@\S+)/)
      .filter((part) => part.trim() !== '');
    // const splitedTitle = text
    // .split(/(#\S+|@\S+)/)
    // .filter((part) => part.trim() !== '');
    return splitedTitle;
  };

  // useEffect(() => {
  //   console.log(tags);
  // }, [tags]);

  /**클릭된 태그를 title에 갈아끼우는 함수 */
  const replaceTagToTitle = (tag: string) => {
    // const tmpList = [...tags];
    // tmpList[indexOfTargetTag] = tag;
    console.log(tag);

    const splitedTitle = props.title
      .split(/(#[\w가-힣]+|@[\w가-힣]+)/)
      .filter((part) => part.trim() !== '');

    // const splitedTitle = splitTitle(props.title);

    // const tmp = splitedTitle.map((item) => {
    //   if (selectedTag === item) {
    //     return tag;
    //   }
    //   return item;
    // });

    splitedTitle[targetTagIndex] = tag;
    console.log(splitedTitle);

    props.setTitle(splitedTitle.join(' '));

    return;
  };
  /**replaceTagToTitle의 트리거 */
  useEffect(() => {
    if (props.clickedTag === '') {
      return;
    }
    return replaceTagToTitle(props.clickedTag);
  }, [props.clickedTag]);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <TextField
        sx={{ m: 1, width: '90%', maxWidth: '600px' }}
        color={props.title.length > titleLen ? 'warning' : 'primary'}
        label={`Title ${props.title.length}/${titleLen}`}
        variant='standard'
        multiline
        rows={5}
        onChange={onTitleHandler}
        placeholder='크림치즈 귀엽죠'
        value={props.title}
      />
    </div>
  );
};

export default TitleInput;
