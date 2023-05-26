import {
  Paper,
  InputBase,
  IconButton,
  Divider,
  Snackbar,
  Button,
} from '@mui/material';
import { Dispatch, SetStateAction, useState, useEffect, Fragment } from 'react';
import { SubmitForm } from './Comment';

const CommentInput = (props: {
  submitNewComment(value: string): void;
  setSubmitForm: Dispatch<SetStateAction<SubmitForm>>;
  submitForm: SubmitForm;
  setSubmitFormToDefault(): void;
}) => {
  const [inputValue, setInputValue] = useState<string>('');
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
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder='댓글 입력'
          inputProps={{ 'aria-label': 'search google maps' }}
          onChange={(e) => {
            setInputValue(e.currentTarget.value);
          }}
          value={inputValue}
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
          color='primary'
          aria-label='directions'
          onClick={(e) => {
            props.submitNewComment(inputValue);
            setInputValue('');
            setOpenSnackbar(false);
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
    </div>
  );
};

export default CommentInput;
