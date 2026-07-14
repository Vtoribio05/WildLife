import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import EndangeredSpecies from './pages/EndangeredSpecies';
import WeatherStation from './pages/WeatherStation';
import MapExplorer from './pages/MapExplorer';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/mapa" element={<MapExplorer />} />
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/endangered" element={<EndangeredSpecies />} />
              <Route path="/weather" element={<WeatherStation />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
