import Management from './pages/Management';

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import Players from './pages/Players';
import Fixtures from './pages/Fixtures';
import Contact from './pages/Contact';
import './css/App.css';
import Home from './pages/Home';
import Navbar from './components/navbar';
import Footer from './components/footer';



// Import your new Gallery component here
import Gallery from './pages/Gallery'; // <--- ADDED THIS LINE

function App() {
  return (
    <Router>
      <div className="App">

        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/About" element={<About />} />
            <Route path="/players" element={<Players />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/management" element={<Management />} />
            <Route path="/players" element={<Players />} />
          
            {/* ADD THIS NEW ROUTE FOR YOUR GALLERY PAGE */}
            <Route path="/gallery" element={<Gallery />} /> {/* <--- ADDED THIS ROUTE */}
          </Routes>
        </main>

        <footer>
          <p>© 2025 Kashani Football Team</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;