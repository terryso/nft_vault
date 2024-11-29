import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NFTGallery from './components/NFTGallery';
import NFTDetail from './pages/NFTDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<NFTGallery />} />
            <Route path="/nft/:contractAddress/:tokenId" element={<NFTDetail />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App
