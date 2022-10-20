import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TransactionHistory from './pages/TransactionHistory';

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<TransactionHistory />} />
        <Route path="/add-new-book" />
        <Route path="/update-book/:id" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
