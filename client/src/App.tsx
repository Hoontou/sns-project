import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './component/page/Signup/Signup';
import Signin from './component/page/Signin/Signin';
import Upload from './component/page/Upload/Upload';
import AlertSock from './component/AlertSocket';
import Feed from './component/page/Feed/Feed';
import UserSetting from './component/page/UserSetting/UserSetting';
import { createBrowserHistory } from 'history';
import Landing from './component/page/Landing/Landing';
import SearchPostsByHashtagResultPage from './component/page/Search/SearchPostsByHashtagResultPage';
import SearchAllPage from './component/page/Search/SearchAll/SearchAllPage';
import MainSearchPage from './component/page/Search/MainSearchPage';
import { FflPage } from './component/page/Ffl/FflPage';
import PostPage from './component/page/Post/PostPage';

export const history = createBrowserHistory();
export const primaryColor = '#0d47a1';
export const mainTemplateStyle = {
  width: '90%',
  margin: '0.7rem auto',
  paddingBottom: '3.5rem',
};

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
        </Routes>
      </Router>
    </>
  );
}

export default App;
