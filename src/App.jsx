import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BasicLayout from './common/BasicLayout';

import Home from './pages/Home';
import Commerce from './pages/Commerce';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BasicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/commerce" element={<Commerce />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
