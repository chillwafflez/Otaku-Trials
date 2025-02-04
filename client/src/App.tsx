import { NavBar } from './components/Navbar';
import { Heardle } from './pages/Heardle';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <div className='min-h-screen flex flex-col'>
          <NavBar/>
          <Routes>
            <Route path="/" element={<Heardle/>} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
