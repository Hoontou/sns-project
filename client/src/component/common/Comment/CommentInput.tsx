import { Paper, InputBase, IconButton, Divider } from '@mui/material';
import { ChangeEvent, useState } from 'react';

const CommentInput = (props: { submitNewComment(value: string): void }) => {
  const [inputValue, setInputValue] = useState<string>('');

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
        <Divider sx={{ height: 10, m: 0.5 }} orientation='vertical' />
        <IconButton
          color='primary'
          aria-label='directions'
          onClick={() => {
            props.submitNewComment(inputValue);
            setInputValue('');
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>게시</span>
        </IconButton>
      </Paper>
    </div>
  );
};

export default CommentInput;
