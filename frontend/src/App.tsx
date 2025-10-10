import { Routes, Route } from 'react-router-dom';
import SeminarsPage from './pages/SeminarsPage';
import SeminarDetailPage from './pages/SeminarDetailPage';
import AdminPage from './pages/AdminPage';
import AdminGate from './components/AdminGate';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SeminarsPage />} />
      <Route path="/seminars/:id" element={<SeminarDetailPage />} />
      <Route path="/admin/*" element={<AdminGate><AdminPage /></AdminGate>} />
    </Routes>
  );
}

export default App;
