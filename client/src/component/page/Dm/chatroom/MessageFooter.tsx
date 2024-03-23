const MessageFooter = () => {
  return (
    <div className='footer-chat'>
      <i
        className='icon fa fa-smile-o clickable'
        style={{ fontSize: '25pt' }}
        aria-hidden='true'
      ></i>
      <input
        type='text'
        className='write-message'
        placeholder='Type your message here'
      ></input>
      <i
        className='icon send fa fa-paper-plane-o clickable'
        aria-hidden='true'
      ></i>
    </div>
  );
};

export default MessageFooter;
