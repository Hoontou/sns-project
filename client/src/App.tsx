import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Signup from './component/view/Signup/Signup';
import Post from './dev-component/Post';
import Signin from './component/view/Signin/Signin';
import Upload from './component/view/Upload/Upload';
import AlertSock from './component/AlertSocket';
import MyFeed from './component/view/Myfeed/Myfeed';
import Userfeed from './component/view/Userfeed/Userfeed';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/up' element={<Upload />} />
          <Route path='/post' element={<Post />} />
          <Route path='/myfeed' element={<MyFeed />} />
          <Route path='/userfeed/:userid' element={<Userfeed />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
