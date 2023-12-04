import { Grid, styled } from '@mui/material';
import { requestUrl } from '../../../../common/etc';
import {
  CocommentContent,
  PostFooterContent,
} from 'sns-interfaces/client.interface';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CommentItemContent } from 'sns-interfaces';
import { VscArrowLeft, VscHeart, VscHeartFilled } from 'react-icons/vsc';
import sample1 from '../../../../asset/sample1.jpg';
import CommentMenu from '../../../common/Comment/CommentMenu';
import { renderTitle } from '../../../common/Post/PostFooter';
import { getElapsedTimeString } from '../../../../common/date.parser';

const emptyCommentItemContent: CommentItemContent = {
  liked: false,
  commentId: 0,
  comment: '',
  createdAt: '',
  userId: '',
  likesCount: 0,
  cocommentCount: 0,
  username: '',
  img: '',
  postId: '',
};

const emptyCocommentContent: CocommentContent = {
  cocommentId: 0,
  commentId: 0,
  img: '',
  userId: '',
  username: '',
  createdAt: '',
  cocomment: '',
  liked: false,
  likesCount: 0,
};

const HighlightCocommentPage = () => {
  const { cocommentId } = useParams(); //url에서 가져온 username

  const [userId, setUserId] = useState<string>('');

  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [comment, setComment] = useState<CommentItemContent>(
    emptyCommentItemContent
  );
  const [cocomment, setCocomment] = useState<CocommentContent>(
    emptyCocommentContent
  );

  /**코멘트 가져오기 */
  const getComment = async () => {
    axios
      .post('/gateway/post/getHighlightCocomment', {
        cocommentId,
      })
      .then((res) => {
        console.log(res.data);
        const result: {
          commentItem: CommentItemContent[];
          cocommentItem: CocommentContent[];
        } = res.data;
        setComment(result.commentItem[0]);
        setCocomment(result.cocommentItem[0]);

        console.log(result);
        setSpin(false);
      });
  };

  useEffect(() => {
    getComment();
  }, []);

  return (
    <>
      {spin && 'waiting...'}

      {!spin && (
        <div style={{ height: '100vh', overflowY: 'auto' }}>
          <div
            style={{
              paddingTop: '0.5rem',
              position: 'fixed',
              zIndex: '999',
              backgroundColor: 'white',
              width: '100%',
            }}
            className='text-center'
          >
            <VscArrowLeft
              style={{
                marginBottom: '0.3rem',
                position: 'fixed',
                left: '1rem',
              }}
              onClick={() => {
                navigate(`/comment/${comment.postId}/${comment.commentId}`);
              }}
            />
            <span>댓글</span>
          </div>
          <div style={{ paddingTop: '2.2rem' }}>
            <div
              onClick={() => {
                navigate(`/post/${comment.postId}`);
              }}
              style={{
                color: 'RoyalBlue',
                marginLeft: '1rem',
                marginTop: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              이 답글이 달린 게시물
            </div>
            <>
              <Grid container spacing={0} style={{ marginBottom: '1rem' }}>
                <Grid item xs={10.5} style={{ overflowWrap: 'break-word' }}>
                  <div
                    style={{
                      float: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: '2.7rem',
                        height: '2.7rem',
                        borderRadius: '70%',
                        overflow: 'hidden',
                        marginTop: '0.4rem',
                        marginLeft: '0.5rem',
                        marginRight: '0.5rem',
                      }}
                    >
                      <img
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        src={
                          comment.img === ''
                            ? sample1
                            : `${requestUrl}/${comment.img}`
                        }
                        alt='profile'
                      />
                    </div>
                  </div>

                  <div style={{ marginLeft: '3.7rem' }}>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        marginRight: '0.5rem',
                        fontWeight: '600',
                      }}
                      onClick={() => {
                        navigate(`/feed/${comment.username}`);
                      }}
                    >
                      {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
                      {comment.username}
                    </span>
                    <span
                      style={{
                        color: 'gray',
                        marginLeft: '0.2rem',
                        fontSize: '0.7rem',
                      }}
                    >
                      {/* {props.content.createdAt} */}
                      {getElapsedTimeString(comment.createdAt)}
                    </span>
                    <div style={{ fontSize: '0.9rem' }}>
                      {renderTitle(comment.comment)}
                    </div>
                  </div>
                </Grid>
                <Grid item xs={1.5} className='text-center'>
                  {comment.createdAt !== '' &&
                    (userId === comment.userId ? (
                      <span>
                        <CommentMenu
                          commentId={comment.commentId}
                          postId={comment.postId}
                          type='comment'
                        />
                      </span>
                    ) : (
                      <span>
                        {!comment.liked ? (
                          <VscHeart
                            fontSize='20px'
                            onClick={() => {
                              // addLike();
                            }}
                          />
                        ) : (
                          <VscHeartFilled
                            fontSize='20px'
                            style={{ color: 'red' }}
                            onClick={() => {
                              // removeLike();
                            }}
                          />
                        )}
                        <div style={{ fontSize: '0.7rem' }}>
                          {comment.likesCount}
                        </div>
                      </span>
                    ))}
                </Grid>
              </Grid>
            </>
            {/* <hr style={{ marginTop: '-0.2rem' }}></hr> */}
            <>
              <Grid container spacing={0} style={{ marginBottom: '1rem' }}>
                <Grid item xs={10.5} style={{ overflowWrap: 'break-word' }}>
                  <div style={{ marginLeft: '3.4rem' }}>
                    <div
                      style={{ width: '2.8rem', height: '100%', float: 'left' }}
                    >
                      <div
                        style={{
                          width: '2.3rem',
                          height: '2.3rem',
                          borderRadius: '70%',
                          overflow: 'hidden',
                          marginTop: '0.4rem',
                          marginRight: '0.5rem',
                        }}
                      >
                        <img
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          src={
                            cocomment.img === ''
                              ? sample1
                              : `${requestUrl}/${cocomment.img}`
                          }
                          alt='profile'
                        />
                      </div>
                    </div>

                    {/* <div style={{ color: 'gray', fontSize: '0.8rem' }}>답글 달기</div> */}

                    <div style={{ marginLeft: '2.8rem' }}>
                      <span
                        style={{
                          marginRight: '0.5rem',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                        }}
                        onClick={() => {
                          navigate(`/feed/${cocomment.username}`);
                        }}
                      >
                        {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
                        {cocomment.username}
                      </span>
                      <span
                        style={{
                          color: 'gray',
                          marginLeft: '0.2rem',
                          fontSize: '0.7rem',
                        }}
                      >
                        {/* {props.content.createdAt} */}
                        {getElapsedTimeString(cocomment.createdAt)}
                      </span>
                      <div style={{ fontSize: '0.8rem' }}>
                        {renderTitle(cocomment.cocomment)}
                      </div>
                    </div>
                  </div>
                </Grid>
                <Grid item xs={1.5} className='text-center'>
                  {cocomment.createdAt !== '' &&
                    (userId === cocomment.userId ? (
                      <CommentMenu
                        type='cocomment'
                        commentId={cocomment.commentId}
                        cocommentId={cocomment.cocommentId}
                      />
                    ) : (
                      <span>
                        {!cocomment.liked ? (
                          <VscHeart
                            fontSize='20px'
                            onClick={() => {
                              // addLike();
                            }}
                          />
                        ) : (
                          <VscHeartFilled
                            fontSize='20px'
                            style={{ color: 'red' }}
                            onClick={() => {
                              // removeLike();
                            }}
                          />
                        )}
                        <div style={{ fontSize: '0.7rem' }}>
                          {cocomment.likesCount}
                        </div>
                      </span>
                    ))}
                </Grid>
              </Grid>
            </>
            <div style={{ marginBottom: '4rem' }}>
              <div
                className='text-center'
                onClick={() => {
                  navigate(`/comment/${comment.postId}/${comment.commentId}`);
                }}
                style={{ color: 'RoyalBlue' }}
              >
                {comment.cocommentCount}개 답글 모두 보기
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default HighlightCocommentPage;
