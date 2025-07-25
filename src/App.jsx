import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BasicLayout from './common/BasicLayout';

import Home from './pages/Home';
import Commerce from './pages/Commerce';
import CommerceDetail from './components/Commerce/CommerceDetail';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrowserRouter>
        <Routes>
          <Route element={<BasicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/commerce" element={<Commerce />} />
            <Route path="/commerce/:id" element={<CommerceDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
