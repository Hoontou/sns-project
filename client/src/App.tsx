import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './component/page/Signup/Signup';
import Signin from './component/page/Signin/Signin';
import Upload from './component/page/Upload/Upload';
import Feed from './component/page/Feed/Feed';
import UserSetting from './component/page/UserSetting/UserSetting';
import { createBrowserHistory } from 'history';
import Landing from './component/page/Landing/Landing';
import SearchPostsByHashtagResultPage from './component/page/Search/SearchPostsByHashtagResultPage';
import SearchAllPage from './component/page/Search/SearchAll/SearchAllPage';
import MainSearchPage from './component/page/Search/MainSearchPage';
import { FflPage } from './component/page/Ffl/FflPage';
import PostPage from './component/page/Post/PostPage';
import CommentPage from './component/page/Post/CommentPage';
import HighlightCommentPage from './component/page/Post/HIghlightCommentPage';
import HighlightCocommentPage from './component/page/Post/Cocomment/HighlightCocommentPage';
import AlertComponent from './component/page/Alert/Alert';
import InBox from './component/page/Dm/Inbox/DmInbox';
import DmChatRoom from './component/page/Dm/chatroom/DmChatRoom';
import CollectionPage from './component/page/Collection/CollectionPage';
import axios from 'axios';

export const history = createBrowserHistory();
export const primaryColor = '#3f50b5';
export const mainTemplateStyle = {
  width: '90%',
  margin: '0.7rem auto',
  paddingBottom: '3.5rem',
};
export const axiosInstance = axios.create({
  baseURL: '/gateway',
  withCredentials: true,
});

export const axiosUploadInstance = axios.create({
  baseURL: '/upload',
  withCredentials: true,
});

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />

          <Route path='/up' element={<Upload />} />

          <Route path='/feed/:targetUsername' element={<Feed />} />
          <Route path='/feed' element={<Feed />} />

          <Route path='/usersetting' element={<UserSetting />} />

          <Route path='/search' element={<MainSearchPage />} />
          <Route path='/search/all/:searchString' element={<SearchAllPage />} />
          <Route
            path='/search/hashtag/:targetHashtag'
            element={<SearchPostsByHashtagResultPage />}
          />

          <Route path='/ffl/:type/:target' element={<FflPage />} />

          <Route path='/post/:postId' element={<PostPage />} />
          <Route path='/post/comment/:postId' element={<CommentPage />} />
          {/* <Route
            path='/comment/:postId/:commentId'
            element={<HighlightCommentPage2 />}
          /> */}
          <Route
            path='/comment/:commentId'
            element={<HighlightCommentPage />}
          />
          <Route
            path='/cocomment/:cocommentId'
            element={<HighlightCocommentPage />}
          />

          <Route path='/alrt' element={<AlertComponent />} />

          <Route path='/direct/inbox' element={<InBox />} />
          <Route path='/direct/t/:chatRoomId' element={<DmChatRoom />} />

          <Route path='/collections' element={<CollectionPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
