import {
  ChevronDown,
  ChevronLeft,
  Mic,
  MicOff,
  ShieldCheck,
  SwitchCamera,
  Video,
  Volume2,
  Phone,
  EllipsisVertical
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ToastAlert from "../TOAST";

const Room = () => {
  const videoRef = useRef(null);
  const [rearCam, setRearCam] = useState(false);
  const [mute, setMute] = useState(false);

  useEffect(() => {
    const contraints = { video: true, audio: true };

    navigator.mediaDevices
      .getUserMedia(contraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        ToastAlert.error(
          "Error accessing Camera and Microphone: " + err.message
        );
      });
  }, []);

  const handleCamChange = () => setRearCam((prev) => !prev);

  const handleMute = () => {
    setMute((prev) => !prev);
    const contraints = { video: true, audio: true };
    navigator.mediaDevices
      .getUserMedia(contraints)
      .then((stream) => {
        if (videoRef.current) {
          mute ? stream.getAudioTracks()[0].enabled = false : stream.getAudioTracks()[0].enabled = true
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    const constraints = {
      video: rearCam
        ? { facingMode: { exact: "environment" } }
        : { facingMode: "user" },
      audio: true,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        ToastAlert.error(
          "Error occurred while trying to switch the camera: " + err.message
        );
      });
  }, [rearCam]);

  return (
    <div className="w-full flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <nav className="flex items-center justify-between px-4 md:px-4 h-20 md:h-40 bg-gradient-to-r from-slate-700 lg:hidden via-black to-gray-900">
        <div className="flex items-center gap-5 md:gap-7">
          <ChevronLeft size={30} className="text-gray-200 md:h-14 md:w-14" />
          <SwitchCamera
            onClick={handleCamChange}
            size={30}
            className="text-gray-300 md:h-14 md:w-14"
          />
          <Volume2 size={25} className="text-gray-300 md:h-14 md:w-14" />
        </div>

        <div className="flex items-center justify-center gap-1 pr-9">
          <ShieldCheck size={20} fill="green" className="md:h-14 md:w-14" />
          <span className="text-gray-200 font-medium text-lg md:text-4xl">
            Syncall
          </span>
          <ChevronDown size={20} className="text-gray-300 md:h-14 md:w-14" />
        </div>
        <div className="bg-red-500 h-5 w-5 rounded md:h-8 md:w-8"></div>
      </nav>
      <main className="flex flex-grow video-contain w-full overflow-hidden relative">
        <div className="absolute inset-0 z-10">
          <video
            ref={videoRef}
            autoPlay
            muted={mute}
            className="w-full h-full object-cover"
          />
        </div>
      </main>

      <footer className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex items-center justify-center bg-[#1A1C1E]/80 backdrop-blur-md text-white px-8 py-3 rounded-2xl space-x-6 shadow-lg">
        {/* Mic Button */}
        <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition duration-300">
          {mute ? <MicOff onClick={handleMute} size={24}/> : <Mic onClick={handleMute} size={24} />}
        </button>

        {/* Video Button */}
        <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition duration-300">
          <Video size={24} />
        </button>

        <button>
          <EllipsisVertical />
        </button>

        {/* End Call Button */}
        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition duration-300">
          <Phone className="transform rotate-135"/>
        </button>
      </footer>
    </div>
  );
};
export default Room;
