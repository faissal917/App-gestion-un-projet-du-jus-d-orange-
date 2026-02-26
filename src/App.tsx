import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
