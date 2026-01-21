import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateRFP } from './pages/CreateRFP';
import { Vendors } from './pages/Vendors';
import { RFPDetail } from './pages/RFPDetail';
import { DataProvider } from './lib/DataContext';

function App() {
  return (
    <DataProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateRFP />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/rfp/:id" element={<RFPDetail />} />
          </Routes>
        </Layout>
      </Router>
    </DataProvider>
  );
}

export default App;
