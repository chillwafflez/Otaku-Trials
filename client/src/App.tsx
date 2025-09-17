import { NavBar } from './components/Navbar';
import { Home } from './pages/Home';
import { Heardle } from './pages/Heardle';
import { HeardleResult } from './pages/HeardleResult';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedResultRoute from './hooks/ProtectedResultRoute';
import ProtectedHeardleRoute from './hooks/ProtectedHeardleRoute';

function App() {
  return (
    <>
      <Router>
        <div className='min-h-screen flex flex-col'>
          <NavBar/>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route element={<ProtectedHeardleRoute />}>
              <Route path="/heardle" element={<Heardle/>} />
            </Route>
            <Route element={<ProtectedResultRoute />}>
              <Route path="/heardleresult" element={<HeardleResult />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
