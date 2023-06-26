import { Grid } from '@mui/material';
import { requestUrl } from '../../../common/etc';
import {
  CocommentContent,
  PostFooterContent,
} from 'sns-interfaces/client.interface';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import CommentItem from './CommentItem';
import axios from 'axios';
import CommentInput from './CommentInput';
import { CommentItemContent } from 'sns-interfaces';
import { VscArrowLeft } from 'react-icons/vsc';
import sample1 from '../../../asset/sample1.jpg';
import { getElapsedTimeString } from '../../../common/date.parser';
import {
  CommentItems,
  SubmitForm,
  defaultCocommentItemContent,
  defaultCommentItemContent,
} from './etc';

const Comment = (props: {
  createdAt: string;
  userId: string;
  setOpenComment: Dispatch<SetStateAction<boolean>>;
  postFooterContent: PostFooterContent;
  setPostFooterContent: Dispatch<SetStateAction<PostFooterContent>>;
}) => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [pending, setPending] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [commentItems, setCommentItems] = useState<CommentItems[]>([]);
  const [submitForm, setSubmitForm] = useState<SubmitForm>({
    type: 'comment',
    postId: props.postFooterContent.id,
  });

  const setSubmitFormToDefault = () => {
    setSubmitForm({
      type: 'comment',
      postId: props.postFooterContent.id,
    });
  };

  /**코멘트 가져오기 */
  const getComments = async () => {
    if (props.postFooterContent.commentCount === 0) {
      return;
    }
    setPending(true);
    axios
      .post('/gateway/post/getcommentlist', {
        postId: props.postFooterContent.id,
        page,
      })
      .then((res) => {
        const { commentItem: comments }: { commentItem: CommentItemContent[] } =
          res.data;
        const newComments: CommentItems[] = comments?.map((i) => {
          //대댓 넣을 리스트 추가
          return { ...i, cocomments: [] };
        });
        if (newComments === undefined) {
          alert('댓글 가져오기를 실패했어요. 나중에 다시 시도해주세요.');
          setPending(false);
          return;
        }
        setPage(page + 1);
        setCommentItems([...commentItems, ...newComments]);
        setPending(false);
      });
  };

  useEffect(() => {
    getComments().then(() => {
      setSpin(false);
    });
  }, []);

  /**대댓 가져오기 */
  const getCocomments = (commentId: number, page: number, index: number) => {
    return axios
      .post('/gateway/post/getcocommentlist', {
        commentId,
        page,
      })
      .then((res) => {
        const {
          cocommentItem: items,
        }: {
          cocommentItem: CocommentContent[];
        } = res.data;

        //원본 리스트 복사후 가져온 대댓을 해당 index 아이템에 붙여넣기
        const tmpItems = [...commentItems];
        tmpItems[index].cocomments = [...tmpItems[index].cocomments, ...items];

        //tmp로 commentItems 갈아끼우기
        setCommentItems(tmpItems);
      });
  };

  /**CommentInput에서 호출, 이거 호출이전에 submitForm의 수정먼저 수행. */
  const submitNewComment = async (value: string) => {
    //1. submitForm의 타입체크 후 post할 url 결정해서 axios
    //2. img, username 가져와서 댓, 대댓 컴포넌트 생성
    //3. 타입에 따라 댓글리스트에 푸시
    if (submitForm.type === 'cocomment') {
      //대댓작성 request
      axios.post('/gateway/post/addcocomment', {
        cocomment: value,
        commentId: submitForm.commentId,
      });

      //내 username, img 가져온다.
      const { img, username, userId } = await axios
        .get('/gateway/user/getusernamewithimg')
        .then((res) => {
          const data: { img: string; username: string; userId: string } =
            res.data;
          return data;
        });
      //cocommentForm 생성
      const newCocomment: CocommentContent = {
        ...defaultCocommentItemContent,
        img,
        username,
        userId,
        cocomment: value,
      };

      //해당하는 댓글의 대댓에 추가후
      // const tmpItems = [...commentItems];
      // tmpItems[submitForm.index].cocomments = [
      //   newCocomment,
      //   ...tmpItems[submitForm.index].cocomments,
      // ];
      // //tmp로 갈아끼우기
      // setCommentItems(tmpItems);

      //위는 원본을 복사 후 갈아끼워서 setState하는 코드.
      //위가 안전할듯. 근데 그냥 아래가 작동이 simple할듯?
      commentItems[submitForm.index].cocomments.unshift(newCocomment);

      //섭밋폼 디폴트로 세팅
      setSubmitFormToDefault();
      return;
    }
    if (submitForm.type === 'comment') {
      //댓 작성 request
      axios.post('/gateway/post/addcomment', {
        comment: value,
        postId: props.postFooterContent.id,
      });

      //내 username, img 가져온다.
      const { img, username, userId } = await axios
        .get('/gateway/user/getusernamewithimg')
        .then((res) => {
          const data: { img: string; username: string; userId: string } =
            res.data;
          return data;
        });

      const newComment = {
        ...defaultCommentItemContent,
        img,
        username,
        comment: value,
        userId,
        cocomments: [],
      };
      //맨앞에 푸시
      commentItems.unshift(newComment);
      // setCommentItems([newComment, ...commentItems]);
      //댓글갯수 +1, 그냥 props.count+1 해도 되긴한데,
      // props.setPostFooterContent({
      //   ...props.postFooterContent,
      //   commentCount: props.postFooterContent.commentCount + 1,
      // });
      //그냥 props를 수정. 권장하는 방법은 아니라는데 그냥 작동이 simple할듯
      //이거 count를 하나 증가시킬지 말지 고민이 많이된다..
      props.postFooterContent.commentCount += 1;

      //섭밋폼 디폴트로 세팅
      setSubmitFormToDefault();
      return;
    }
  };

  const renderComment = commentItems?.map((content, index) => {
    return (
      <CommentItem
        content={content}
        key={index}
        setSubmitForm={setSubmitForm}
        index={index}
        getCocomments={getCocomments}
      />
    );
  });
  return (
    <>
      {spin && 'waiting...'}

      {!spin && (
        <div style={{ height: '80vh', overflowY: 'auto' }}>
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
                props.setOpenComment(false);
              }}
            />
            <span>댓글</span>
          </div>
          <div style={{ paddingTop: '2.2rem' }}>
            <Grid
              container
              spacing={0}
              style={{ marginTop: '1rem', marginBottom: '1rem' }}
            >
              <Grid item xs={10.5} style={{ overflowWrap: 'break-word' }}>
                <div
                  style={{
                    width: '2.7rem',
                    height: '2.7rem',
                    borderRadius: '70%',
                    overflow: 'hidden',
                    marginTop: '0.4rem',
                    marginLeft: '0.5rem',
                    marginRight: '0.5rem',
                    float: 'left',
                  }}
                >
                  <img
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    src={
                      props.postFooterContent.img === ''
                        ? sample1
                        : `${requestUrl}/${props.postFooterContent.img}`
                    }
                    alt='profile'
                  />
                </div>
                <div>
                  <span
                    style={{
                      marginRight: '0.5rem',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                    }}
                    onClick={() => {
                      navigate(`/userfeed/${props.userId}`);
                    }}
                  >
                    {/*props.metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
                    {props.postFooterContent.username}
                  </span>
                  <span
                    style={{
                      color: 'gray',
                      marginLeft: '0.2rem',
                      fontSize: '0.7rem',
                    }}
                  >
                    {getElapsedTimeString(props.createdAt)}
                  </span>
                  <div style={{ fontSize: '0.9rem' }}>
                    {props.postFooterContent.title}
                  </div>
                </div>
              </Grid>
              <Grid item xs={9.5}></Grid>
            </Grid>
            <hr style={{ marginTop: '-0.2rem' }}></hr>
            {commentItems.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '1rem',
                  color: 'gray',
                  marginTop: '2rem',
                }}
              >
                표시할 댓글이 없습니다.
              </div>
            )}
            <div style={{ marginBottom: '4rem' }}>
              <div>{commentItems.length > 0 && renderComment}</div>
              {props.postFooterContent.commentCount > commentItems?.length && (
                <div
                  className='text-center'
                  onClick={getComments}
                  style={{ color: 'RoyalBlue' }}
                >
                  {pending ? '가져오는 중...' : '더 불러오기'}
                </div>
              )}
            </div>
            <div>
              <CommentInput
                submitNewComment={submitNewComment}
                setSubmitForm={setSubmitForm}
                submitForm={submitForm}
                setSubmitFormToDefault={setSubmitFormToDefault}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Comment;
