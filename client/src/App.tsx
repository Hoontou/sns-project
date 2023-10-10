import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './component/view/Signup/Signup';
import Signin from './component/view/Signin/Signin';
import Upload from './component/view/Upload/Upload';
import AlertSock from './component/AlertSocket';
import Feed from './component/view/Feed/Feed';
import UserSetting from './component/view/UserSetting/UserSetting';
import { createBrowserHistory } from 'history';
import Landing from './component/view/Landing/Landing';
import SearchHashtag from './component/view/Search/SearchHashtag';

export const history = createBrowserHistory();

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
          <Route
            path='/search/tag/:targetHashtag'
            element={<SearchHashtag />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
