import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Signin from './dev-component/Signin';
import Signup from './dev-component/Signup';
import Upload from './dev-component/Upload';
import AlertSock from './dev-component/AlertSocket';

function App() {
  return (
    <>
      <AlertSock />
      <Router>
        <Routes>
          <Route path='/' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/up' element={<Upload />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
