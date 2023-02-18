import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Signin from './dev-component/Signin';
function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Signin />} />
      </Routes>
    </Router>
  );
}

export default App;
