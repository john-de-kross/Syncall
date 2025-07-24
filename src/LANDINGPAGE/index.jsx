import React, { useEffect, useState } from "react";
import { Copy, Link, Phone } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { AllContext } from "../CONTEXT";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import ToastAlert from "../TOAST";



const LandingPage = () => {
  const [clickCopy, setClickCopy] = useState(false);
  const { roomId, setRoomId, username, setUsername, socket } = AllContext();
  const navigate = useNavigate();
  

  const handleCopyTouch = () => {
    setClickCopy(true);
    navigator.clipboard.writeText(roomId);
  };

  useEffect(() => {
    setTimeout(() => {
      if (clickCopy) {
        setClickCopy(false);
      }
    }, 1500);
  }, [clickCopy]);

  useEffect(() => {
    if (!socket) return;
    const handleConnection = () => {
      console.log('Socket connected');
    };
    const handleRoomId = (data) => {
      setRoomId(data.roomId);
      ToastAlert.info('Room ID is automatically copied to clipboard');
      navigator.clipboard.writeText(data.roomId);
      
    }
    socket.on('connect', handleConnection);
    socket.on('roomId', handleRoomId);

    return () => {
      socket.off('connect', handleConnection);
      socket.off('roomId', handleRoomId);
      console.log('socket disconnected');
    }
  }, [socket]);


  const handleRoomCreation = async (e) => {
    e.preventDefault();
    if (!username) {
      return ToastAlert.error('Please enter a username');
    }
    try {

      const response = await axios.post('https://syncall-server-1.onrender.com/api/v1/user/create-room', { username });
      navigate(`/room/${response.data.data.room.roomId}`);
      
      
    } catch (err) {
      console.log(err)
      if (err.response) {
        if (err.response.data.message.startsWith('E11000 duplicate key error')) {
          ToastAlert.error('Username already exists. Please choose a different username.');
        } else if (err.response.data.message.startsWith('RoomCreator validation failed: username: Path `username` (`To`) is shorter than the minimum allowed length')) {
          ToastAlert.error('Username must be at least 3 characters long.');
        } else {
          ToastAlert.error('An error occurred while creating the room');
        }

      } else {
        ToastAlert.error('Network error. Please try again later.');
      }
    }
    
    
  }

  const handleJoinRoom = async(e) => {
    e.preventDefault();
    if (!roomId || !username) {
      return ToastAlert.error('Please enter both Room ID and Username');
    }
    try {
      const response = await axios.post('https://syncall-server-1.onrender.com/api/v1/user/join-room', { roomId, username });
      navigate(`/room/${roomId}`);
      console.log(response.data);
      ToastAlert.success(`Joined room: ${roomId}`);

    } catch (err) {
      console.error(err);
      if (err.response) {
        if (err.response.status === 404) {
          ToastAlert.error('Room not found. Please check the Room ID.');
        } else if (err.response.status === 400) {
          ToastAlert.error('Invalid Room ID. Please enter a valid Room ID.');

        } else if (err.response.data.message.startsWith('E11000 duplicate key error')) {
          ToastAlert.error('Username already exists. Please choose a different username.');
        } else if (err.response.data.message.startsWith('RoomCreator validation failed: username: Path `username` (`To`) is shorter than the minimum allowed length')) {
          ToastAlert.error('Username must be at least 3 characters long.');
         }
        else {
          ToastAlert.error('An error occurred while joining the room');
        }

      } else {
        ToastAlert.error('Network error. Please try again later.');
      }
    }
  }



  

  return (
    <div className="w-full min-h-screen lg:mx-auto lg:w-[90%] lg:[70vh] bg-gradient-to-b from-blue-400 to-blue-900  flex items-center justify-center lg:bg-slate-700 lg:bg-none lg:from-none lg:to-none">
      <div className="w-full h-full lg:w-[60%] lg:h-[76vh] lg:bg-gradient-to-br lg:from-slate-600 lg:via-slate-700 lg:to-indigo-500 lg:grid lg:py-7 lg:grid-cols-2 lg:rounded-lg lg:shadow-lg">
        <div className="h-[40vh] brand-text lg:w-[90%] lg:h-[67vh] text-white text-sm shadow-lg shadow-black rounded-r-[20%] bg-gradient-to-b from-blue-400 to-blue-900 flex flex-col justify-center items-center text-center gap-2">
          <h1 className="text-3xl md:text-7xl lg:text-3xl mb-4 font-bold py-2 fade-in">
            Welcome to Syncall
          </h1>
          <p className="text-lg md:text-5xl lg:text-xl font-light text-gray-100">
            The ultimate video call app
          </p>
          <p className="text-lg md:text-5xl lg:text-xl font-light text-gray-100">
            Enjoy your seamless communication with family & friends.
          </p>
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:h-60 lg:mt-1 lg:w-full ">
            <img
              className="h-full phone"
              src="/video-call.png"
              alt="video-call"
            />
          </div>
        </div>
        <div className="w-full mt-3 lg:w-[80%] lg:h-[60vh] flex flex-col place-items-center lg:items-start">
          <h1 className="font-bold text-white text-2xl md:text-6xl lg:text-3xl mb-4">
            Create & Invite
          </h1>
          <p className="text-gray-200 text-lg md:text-4xl lg:text-xl">
            Start your call instantly
          </p>
          <p className="text-gray-200 text-lg md:text-4xl lg:text-xl">
            No login, no delay
          </p>

          <form
            action=""
            className="lg:mt-7 mt-3 px-7 md:px-7 space-x-2 space-y-2 w-full lg:px-0 lg:space-x-0 lg:space-y-4 flex flex-col items-start "
          >
            <label
              htmlFor=""
              className="text-gray-300 text-base md:font-medium md:text-2xl lg:font-normal lg:text-lg mb-1"
            >
              Username
            </label>
            <input
              className="outline-none border text-base font-medium text-white p-2 w-full h-12 md:h-20 md:text-2xl lg:text-lg lg:h-10 bg-gradient-to-r from-gray-700 to-gray-900 border-gray-500 rounded-lg"
              type="text"
              name="username"
              value={username}
              onChange={(e)=> setUsername(e.target.value)}
              placeholder="'eg: Michael' "
              autoComplete="off"
            />
            <label
              htmlFor=""
              className="text-gray-300 text-base md:text-2xl md:font-medium lg:font-normal lg:text-lg mb-1 "
            >
              Room ID
            </label>
            <input
              className="outline-none relative text-base font-medium border text-white p-2 w-full h-12 md:text-2xl md:h-20 lg:h-10 lg:text-lg bg-gradient-to-r from-gray-700 to-gray-900 border-gray-500 rounded-lg"
              type="text"
              value={roomId}
              name="roomId"
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="abc12345"
              autoComplete="off"
            />
            <Copy
              onClick={handleCopyTouch}
              className="absolute mt-32 md:mt-46 md:right-[5%] md:h-8 md:w-8 lg:mt-33 w-4 h-4 outline-none lg:h-4 lg:w-4 right-[12%] lg:cursor-pointer text-gray-200 lg:right-[30%]"
              id="copy-icon"
            />
            <Tooltip
              anchorSelect="#copy-icon"
              className="tooltip "
              content={
                <span className="text-base font-medium md:text-3xl lg:text-base">
                  Copied!
                </span>
              }
              isOpen={clickCopy}
            />

            <p className="text-xs w-full flex justify-center md:text-lg lg:text-xs text-gray-400 px-4">
              Tip: Unique ID is automatically copied
            </p>
            <div className="btn w-full flex flex-col lg:flex-row place-items-center gap-4 md:flex lg:justify-between md:gap-4">
              <button onClick={handleRoomCreation} className="flex justify-center gap-3 items-center font-normal lg:font-medium lg:h-9 text-gray-100 shadow rounded-xl lg:text-base shadow-slate-900 md:h-16 md:text-2xl bg-blue-950 w-[60%] lg:w-[70%] h-9 lg:rounded-2xl">
                <Phone className="text-green-600 h-5 w-5 md:h-8 md:w-8 lg:h-6 lg:w-6 fill-green-600" />
                Create Room
              </button>
              <button onClick={handleJoinRoom} className="flex justify-center items-center gap-3 font-normal lg:font-medium text-gray-100 rounded-xl shadow md:h-16 md:text-2xl lg:text-base shadow-slate-900 bg-blue-950 lg:h-9 w-[60%] lg:w-[70%] h-9 lg:rounded-2xl">
                <Link className="text-green-600 h-5 w-5 md:h-8 md:w-8 lg:h-6 lg:w-6" />
                Join Room
              </button>
            </div>
          </form>
        </div>
        <footer className="w-full text-center text-gray-300 text-lg md:text-xl mt-3 lg:hidden">
          By using <span className="text-xl font-medium md:text-2xl">Syncall</span>, you agree to our
          <a className="underline text-blue-500 hover:text-orange-300" href=""> Privacy Policy</a>
          <a className="underline text-blue-500 hover:text-orange-300" href=""> Terms of Use</a>
        </footer>
      </div>
      
    </div>
  );
};

export default LandingPage;
