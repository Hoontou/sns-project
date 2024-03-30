import {
  CocommentContent,
  PostFooterContent,
} from 'sns-interfaces/client.interface';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CommentItemContent } from 'sns-interfaces';
import { VscArrowLeft } from 'react-icons/vsc';
import { CommentItems, SubmitForm } from '../../common/Comment/etc';
import CommentItem from '../../common/Comment/CommentItem';
import { axiosInstance } from '../../../App';

const HighlightCommentPage = () => {
  const { commentId } = useParams(); //url에서 가져온 username

  const [userId, setUserId] = useState<string>('');
  const [postId, setPostId] = useState<string>('');

  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [commentItems, setCommentItems] = useState<CommentItems[]>([]);
  const [submitForm, setSubmitForm] = useState<SubmitForm>({
    type: 'comment',
    postId: postId,
    postOwnerUserId: userId,
  });

  /**코멘트 가져오기 */
  const getComment = async () => {
    setSpin(true);
    axiosInstance
      .post('/post/getcomment', {
        commentId,
      })
      .then((res) => {
        console.log(res.data);
        const result: {
          commentItem: CommentItemContent[];
          userId: string;
          postFooterContent: PostFooterContent;
        } = res.data;

        if (result.commentItem.length === 0) {
          setSpin(false);
        }

        const newComments: CommentItems[] = result.commentItem.map((i) => {
          //대댓 넣을 리스트 추가
          return { ...i, cocomments: [] };
        });

        setUserId(result.userId);
        setPostId(result.commentItem[0].postId);
        setCommentItems([...commentItems, ...newComments]);
        setSpin(false);
      });
  };

  useEffect(() => {
    getComment();
  }, []);

  /**대댓 가져오기 */
  const getCocomments = (
    commentId: number,
    page: number,
    index: number
  ): Promise<number> => {
    return axiosInstance
      .post('/post/getcocommentlist', {
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
        return items.length;
      });
  };

  const renderComment = commentItems?.map((content, index) => {
    return (
      <CommentItem
        content={content}
        key={content.commentId}
        setSubmitForm={setSubmitForm}
        index={index}
        getCocomments={getCocomments}
        userId={userId}
        postId={postId}
      />
    );
  });
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
                navigate(-1);
              }}
            />
            <span>댓글</span>
          </div>
          <div style={{ paddingTop: '2.2rem' }}>
            {postId !== '' && (
              <div
                onClick={() => {
                  navigate(`/post/${postId}`);
                }}
                style={{
                  color: 'RoyalBlue',
                  marginLeft: '1rem',
                  marginTop: '1rem',
                  marginBottom: '0.5rem',
                }}
              >
                이 댓글이 달린 게시물
              </div>
            )}

            {commentItems.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '1rem',
                  color: 'gray',
                  marginTop: '2rem',
                  marginBottom: '1rem',
                }}
              >
                해당 댓글이 삭제됐거나 잘못된 접근입니다.
              </div>
            )}
            <div style={{ marginBottom: '4rem' }}>
              <div>{commentItems.length > 0 && renderComment}</div>
              {postId !== '' && (
                <div
                  className='text-center'
                  onClick={() => {
                    navigate(`/post/comment/${postId}`);
                  }}
                  style={{ color: 'RoyalBlue' }}
                >
                  모든 댓글 보기
                </div>
              )}
              {postId === '' && (
                <div
                  className='text-center'
                  onClick={() => {
                    navigate(-1);
                  }}
                  style={{ color: 'RoyalBlue' }}
                >
                  뒤로 가기
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default HighlightCommentPage;
