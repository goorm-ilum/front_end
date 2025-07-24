import { Routes, Route, Outlet } from 'react-router-dom';
import CommerceList from '../components/Commerce/CommerceList';
import CommerceDetail from '../components/Commerce/CommerceDetail';
import CommercePayment from '../components/Commerce/CommercePayment';

const Commerce = () => {
  return (
    <Routes>
      <Route path="/" element={<CommerceList />} />
      <Route path=":id" element={<CommerceDetail />} />
      <Route path=":id/payment" element={<CommercePayment />} />
    </Routes>
  );
};

export default Commerce;
