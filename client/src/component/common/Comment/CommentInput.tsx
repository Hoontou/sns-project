import {
  Paper,
  InputBase,
  IconButton,
  Divider,
  Snackbar,
  Button,
} from '@mui/material';
import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  Fragment,
  ChangeEvent,
  forwardRef,
} from 'react';
import { SubmitForm } from './interface';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

const CommentInput = (props: {
  submitNewComment(): void;
  setSubmitForm: Dispatch<SetStateAction<SubmitForm>>;
  submitForm: SubmitForm;
  setSubmitingComment: Dispatch<SetStateAction<string>>;
  setSubmitFormToDefault(): void;
  submitingComment: string;
  setSearchbarDisplay: Dispatch<SetStateAction<boolean>>;
  connectSocket(): void;
  setSearchRequestString: Dispatch<SetStateAction<string>>;
  clickedTag: string;
}) => {
  const [snackOpen, setSnackOpen] = useState(false);

  const handleSnackClick = () => {
    setSnackOpen(true);
  };

  const handleSnackClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackOpen(false);
  };

  const [targetComment, setTarget] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  useEffect(() => {
    if (props.submitForm.type === 'cocomment') {
      setTarget(props.submitForm.targetUsername);
      setOpenSnackbar(true);
      return;
    }
    setTarget('');
    return;
  }, [props.submitForm]);
  //여기부터 titleInput에서 가져온 코드
  const [socketConnected, setConnected] = useState<boolean>(false);
  const [targetTagIndex, setTargetTagIndex] = useState<number>(0);

  const onSubmitingCommentHandler = (e: ChangeEvent<HTMLInputElement>) => {
    //새로입력받은 타이틀과 저장돼있던 타이틀 비교한 후 타이틀 갈아끼우기
    const diff = checkHashtagDiff(props.submitingComment, e.target.value);
    props.setSubmitingComment(e.target.value);

    //해시태그 추출

    //태그 있으면 실시간 검색을 위해 변경된 태그를 찾는다

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

    return;
  };

  /**기존 리스트, 수정된 리스트 받아와서 어떤게 수정됐는지 리턴*/
  const checkHashtagDiff = (
    original: string,
    tmp: string
  ): { changedTag: string | undefined } | undefined => {
    const splitedOriginal = splitTitle(original);
    const splitedTmp = splitTitle(tmp);

    //해시태그 삭제한 경우, 수정한 경우, 수정이 없는경우
    //1. 두개의 길이가 다르면, 바로그냥 리턴 -> 삭제한경우, 막 추가한 경우
    if (splitedTmp.length !== splitedOriginal.length) {
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

    return splitedTitle;
  };

  /**클릭된 태그를 title에 갈아끼우는 함수 */
  const replaceTagToTitle = (tag: string) => {
    const splitedTitle = splitTitle(props.submitingComment);

    splitedTitle[targetTagIndex] = tag;

    props.setSubmitingComment(splitedTitle.join(' '));

    return;
  };
  /**replaceTagToTitle의 트리거 */
  useEffect(() => {
    if (props.clickedTag === '') {
      return;
    }
    return replaceTagToTitle(props.clickedTag);
  }, [props.clickedTag]);

  const action = (
    <Fragment>
      <Button
        variant='contained'
        size='small'
        onClick={() => {
          setOpenSnackbar(false);
          props.setSubmitFormToDefault();
        }}
      >
        취소
      </Button>
    </Fragment>
  );

  return (
    <div>
      <Paper
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '3rem',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder='댓글 입력'
          inputProps={{ 'aria-label': 'search google maps' }}
          onChange={onSubmitingCommentHandler}
          value={props.submitingComment}
        />
        {/* {targetComment !== '' && (
          <>
            <Divider sx={{ height: 10, m: 0.5 }} orientation='vertical' />
            <span
              style={{ color: 'RoyalBlue' }}
              onClick={props.setSubmitFormToDefault}
            >
              {targetComment}에게 답글 작성중
            </span>
          </>
        )} */}
        <Divider sx={{ height: 10, m: 0.5 }} orientation='vertical' />
        <IconButton
          color={props.submitingComment ? 'primary' : 'default'}
          aria-label='directions'
          onClick={(e) => {
            props.setSubmitingComment(props.submitingComment);
            props.submitNewComment();
            setOpenSnackbar(false);
            handleSnackClick();
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>게시</span>
        </IconButton>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={1000}
        message={
          //사라지는속도보다 targetComment의 값 삭제가 빨라서 이상하게보임.
          //그래서 아래 조건문 넣었음.
          targetComment === '' ? '' : `${targetComment} 에게 답글 작성중`
        }
        action={action}
        style={{ marginBottom: '3rem' }}
      />

      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={handleSnackClose}
      >
        <Alert
          onClose={handleSnackClose}
          severity='success'
          sx={{ width: '100%', marginBottom: '4rem' }}
        >
          Comment request sended.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CommentInput;
