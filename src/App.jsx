
import './App.css'
import LandingPage from './LANDINGPAGE'
import Room from './ROOM'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AllContext } from './CONTEXT';
import { useEffect } from 'react';

function App() {
  const { username, socket } = AllContext()
  
   useEffect(() => {
    if (username) {
      socket.emit("register", username);
      console.log('username registered:', username);
    }
  }, [socket]);



  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>

      </Router>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={true}
      />
      
    </>
  )
}

export default App
