
import './App.css'
import LandingPage from './LANDINGPAGE'
import Room from './ROOM'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";

function App() {


  return (
    <>
      {/* <LandingPage /> */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={true}
      />
      <Room />
    </>
  )
}

export default App
