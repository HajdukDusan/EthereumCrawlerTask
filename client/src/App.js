import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TransactionHistory from './pages/TransactionHistory';
import HistoricallyAvailableValue from './pages/HistoricallyAvailableValue';

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<TransactionHistory />} />
        <Route path="/historical-value" element={<HistoricallyAvailableValue />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
