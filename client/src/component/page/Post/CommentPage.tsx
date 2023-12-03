import { Grid } from '@mui/material';
import { requestUrl } from '../../../common/etc';
import {
  CocommentContent,
  PostFooterContent,
} from 'sns-interfaces/client.interface';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CommentItemContent } from 'sns-interfaces';
import { VscArrowLeft } from 'react-icons/vsc';
import sample1 from '../../../asset/sample1.jpg';
import { SearchResult } from '../../page/Upload/Upload';
import { Socket, io } from 'socket.io-client';
import {
  CommentItems,
  SubmitForm,
  defaultCocommentItemContent,
  defaultCommentItemContent,
} from '../../common/Comment/etc';
import CommentItem from '../../common/Comment/CommentItem';
import { renderTitle } from '../../common/Post/PostFooter';
import CommentInput from '../../common/Comment/CommentInput';
import SearchResultModal from '../../common/SearchResultModal';
import { emptyPostFooterContent } from '../../common/Post/post.interfaces';

const CommentPage = () => {
  const { postId } = useParams(); //url에서 가져온 username
  const [postFooterContent, setPostFooterContent] = useState<PostFooterContent>(
    emptyPostFooterContent
  );
  const [userId, setUserId] = useState<string>('');

  const navigate = useNavigate();
  const [spin, setSpin] = useState<boolean>(true);
  const [pending, setPending] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [commentItems, setCommentItems] = useState<CommentItems[]>([]);
  const [submitForm, setSubmitForm] = useState<SubmitForm>({
    type: 'comment',
    postId: postFooterContent.id,
    postOwnerUserId: postFooterContent.userId,
  });
  const [enablingGetMoreButton, setEnablingGetMoreButton] =
    useState<boolean>(true);

  const [submitingComment, setSubmitingComment] = useState<string>('');

  //upload에서 복붙한 코드
  const [searchSocket, setSearchSocket] = useState<Socket | undefined>(
    undefined
  );
  const [searchRequestString, setSearchRequestString] = useState<string | ''>(
    ''
  );
  const [searchResult, setSearchResult] = useState<SearchResult | undefined>(
    undefined
  );

  //검색결과창 컨트롤
  const [searchBarSpin, setSearchBarSpin] = useState<boolean>(false);
  const [searchBarDisplay, setSearchbarDisplay] = useState<boolean>(false);
  const [clickedTag, setClickedTag] = useState<string>('');
  //연속입력에 대한 검색딜레이 설정
  let timeoutId: NodeJS.Timeout | null = null;
  const delay = 700; //ms기준임

  //소켓연결 함수, 자식인 titleInput에서 실행함
  const connectSocket = () => {
    if (searchSocket === undefined) {
      const socket = io();
      socket.on('searchUserOrHashtagResult', (data: SearchResult) => {
        setSearchResult(data);
        //데이터 가져왔으면 스핀멈춘다
        setSearchBarSpin(false);
      });
      setSearchSocket(socket);
    }
  };

  //웹소켓에 검색날리는 effect, 연속입력 대비해서  타임아웃 걸었음
  useEffect(() => {
    if (searchRequestString.length < 3 || searchRequestString.at(1) === ' ') {
      setSearchbarDisplay(false);
      return;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      console.log('send search string :', searchRequestString);
      //창띄우고 스핀돌리고, 데이터 받아왔으면 스핀멈추고(이건 socket.on에서 수행)
      if (searchBarDisplay === false) {
        setSearchbarDisplay(true);
      }
      setSearchBarSpin(true);
      searchSocket?.emit('searchUserOrHashtag', {
        searchString: searchRequestString,
      });
    }, delay);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchRequestString]);

  /**타이틀에 태그만 있을 시 안꺼지는거 fix위해 필요 */
  useEffect(() => {
    if (submitingComment === '@' || submitingComment === '') {
      setSearchbarDisplay(false);
    }
  }, [submitingComment]);

  //여기까지

  const setSubmitFormToDefault = () => {
    setSubmitForm({
      type: 'comment',
      postId: postFooterContent.id,
      postOwnerUserId: postFooterContent.userId,
    });
  };

  const getCommentPageContent = async () => {
    return axios
      .post('/gateway/post/getCommentPageContent', { postId })
      .then((res) => {
        const result: {
          postFooterContent: PostFooterContent;
          userId: string;
        } = res.data;

        setPostFooterContent(result.postFooterContent);
        setUserId(result.userId);

        if (result.postFooterContent.commentCount === 0) {
          setEnablingGetMoreButton(false);
          return;
        }
        return getComments();
      });
  };

  /**코멘트 가져오기 */
  const getComments = async () => {
    setPending(true);
    axios
      .post('/gateway/post/getcommentlist', {
        postId,
        page,
      })
      .then((res) => {
        const { commentItem: comments }: { commentItem: CommentItemContent[] } =
          res.data;
        const newComments: CommentItems[] = comments?.map((i) => {
          //대댓 넣을 리스트 추가
          return { ...i, cocomments: [] };
        });
        if (comments.length !== 10) {
          setEnablingGetMoreButton(false);
        }
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
    window.history.pushState(null, document.title, window.location.href);

    getCommentPageContent().then(() => {
      setSpin(false);
    });
  }, []);

  /**대댓 가져오기 */
  const getCocomments = (
    commentId: number,
    page: number,
    index: number
  ): Promise<number> => {
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
        return items.length;
      });
  };

  /**CommentInput에서 호출, 이거 호출이전에 submitForm의 수정먼저 수행. */
  const submitNewComment = async () => {
    if (submitingComment === '') {
      return;
    }
    //1. submitForm의 타입체크 후 post할 url 결정해서 axios
    //2. img, username 가져와서 댓, 대댓 컴포넌트 생성
    //3. 타입에 따라 댓글리스트에 푸시
    if (submitForm.type === 'cocomment') {
      //대댓작성 request
      //댓글작성자에게 알림 넣기위해서 주인 id도 보냄
      axios.post('/gateway/post/addcocomment', {
        cocomment: submitingComment,
        commentId: submitForm.commentId,
        commentOwnerUserId: submitForm.commentOwnerUserId,
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
        cocomment: submitingComment,
        cocommentId: Date.now(),
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
      // commentItems[submitForm.index].cocommentCount += 1;

      //섭밋폼 디폴트로 세팅
      setSubmitFormToDefault();
      setSubmitingComment('');

      return;
    }
    if (submitForm.type === 'comment') {
      //댓 작성 request
      //글작성자에게 알림 넣기위해서 주인 id도 보냄
      axios.post('/gateway/post/addcomment', {
        comment: submitingComment,
        postId: postFooterContent.id,
        postOwnerUserId: postFooterContent.userId,
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
        comment: submitingComment,
        userId,
        cocomments: [],
        commentId: Date.now(),
      };
      //맨앞에 푸시
      commentItems.unshift(newComment);
      postFooterContent.commentCount += 1;

      //섭밋폼 디폴트로 세팅
      setSubmitFormToDefault();
      setSubmitingComment('');
      return;
    }
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
        postId={postFooterContent.id}
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
                navigate(`/post/${postFooterContent.id}`);
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
                      postFooterContent.img === ''
                        ? sample1
                        : `${requestUrl}/${postFooterContent.img}`
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
                      navigate(`/feed/${postFooterContent.username}`);
                    }}
                  >
                    {/*metadata.userId 로 요청날려서 오는값 useState로 채워넣기*/}
                    {postFooterContent.username}
                  </span>

                  <div style={{ fontSize: '0.9rem' }}>
                    {renderTitle(postFooterContent.title)}
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
              {enablingGetMoreButton && (
                <div
                  className='text-center'
                  onClick={() => {
                    getComments();
                  }}
                  style={{ color: 'RoyalBlue' }}
                >
                  {pending ? '가져오는 중...' : '더 불러오기'}
                </div>
              )}
            </div>
            <div>
              <CommentInput
                setSubmitingComment={setSubmitingComment}
                submitNewComment={submitNewComment}
                setSubmitForm={setSubmitForm}
                submitForm={submitForm}
                setSubmitFormToDefault={setSubmitFormToDefault}
                submitingComment={submitingComment}
                setSearchbarDisplay={setSearchbarDisplay}
                connectSocket={connectSocket}
                setSearchRequestString={setSearchRequestString}
                clickedTag={clickedTag}
              />
            </div>
            {searchBarDisplay && (
              <SearchResultModal
                spin={searchBarSpin}
                searchResult={searchResult}
                setSearchbarDisplay={setSearchbarDisplay}
                setClickedTag={setClickedTag}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default CommentPage;
