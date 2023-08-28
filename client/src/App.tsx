import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './component/view/Signup/Signup';
import Signin from './component/view/Signin/Signin';
import Upload from './component/view/Upload/Upload';
import AlertSock from './component/AlertSocket';
import Userfeed from './component/view/Userfeed/Userfeed';
import UserSetting from './component/view/UserSetting/UserSetting';
import { createBrowserHistory } from 'history';
import Landing from './component/view/Landing/Landing';

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
          {/* <Route path='/myfeed' element={<MyFeed />} /> */}
          {/* <Route path='/userfeed/:targetUsername' element={<Userfeed />} /> */}
          <Route path='/feed/:targetUsername' element={<Userfeed />} />
          <Route path='/feed' element={<Userfeed />} />

          <Route
            path='/usersetting/:targetUsername'
            element={<UserSetting />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
