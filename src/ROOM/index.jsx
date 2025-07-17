import {
  Calculator,
  ChevronDown,
  ChevronLeft,
  CircleEllipsis,
  Disc2,
  Heart,
  MessageCircleMore,
  Mic,
  Notebook,
  ScreenShare,
  ShieldCheck,
  SwitchCamera,
  Users,
  Video,
  Volume2,
} from "lucide-react";
import React, { useEffect, useRef } from "react";

const Room = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        const contraints = { video: true, audio: true };

        navigator.mediaDevices.getUserMedia(contraints)
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
            }
            
            }).catch((err) => {
            console.log("Media err", err)
        })
        
    }, [])
  return (
    <div className="w-full flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <nav className="flex items-center justify-between px-4 md:px-4 h-20 md:h-40 bg-gradient-to-r from-slate-700 lg:hidden via-black to-gray-900">
        <div className="flex items-center gap-5 md:gap-7">
          <ChevronLeft size={30} className="text-gray-200 md:h-14 md:w-14" />
          <SwitchCamera size={30} className="text-gray-300 md:h-14 md:w-14" />
          <Volume2 size={25} className="text-gray-300 md:h-14 md:w-14" />
        </div>

        <div className="flex items-center justify-center gap-1 pr-9">
          <ShieldCheck size={20} fill="green" className="md:h-14 md:w-14" />
          <span className="text-gray-200 font-medium text-lg md:text-4xl">
            Syncall
          </span>
          <ChevronDown size={20} className="text-gray-300 md:h-14 md:w-14" />
        </div>
              <div className="bg-red-500 h-5 w-5 rounded md:h-8 md:w-8">          
        </div>
      </nav>
        <main className="flex flex-grow video-contain w-full">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full" />
      </main>
      <footer className=" ">
        <div className="flex overflow-auto justify-evenly w-full gap-8 items-center px-4 h-20 bg-gradient-to-r from-gray-800 via-black to-gray-950">
          <div className="flex flex-col gap-1 items-center">
            <Mic size={25} stroke="white" className="text-gray-300" />
            <span className="text-base font-normal text-gray-300">Mute</span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <Disc2 size={25} className="text-gray-300"/>
            <span className="text-base font-normal text-gray-300">Audio</span>
          </div>
          <div className="flex flex-col whitespace-nowrap gap-1 items-center">
            <Video size={25} className="text-gray-300"/>
            <span className="text-base flex font-normal text-gray-300">
              Stop video
            </span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <MessageCircleMore size={25} className="text-gray-300"/>
            <span className="text-base font-normal text-gray-300">Chat</span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <Users size={25} className="text-gray-300"/>
            <span className="text-base font-normal text-gray-300">
              Participants
            </span>
          </div>
          <div className="flex flex-col gap-1 whitespace-nowrap items-center">
            <ScreenShare size={25} className="text-gray-300"/>
            <span className="text-base font-normal text-gray-300">
              screen record
            </span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <Notebook size={25} className="text-gray-300"/>
            <span className="text-base font-normal text-gray-300">Note</span>
          </div>

          <div className="flex flex-col gap-1 items-center">
            <Heart fill="red" stroke="red" size={25} className="text-gray-300"/>
            <span className="text-base font-normal text-gray-300">Reaction</span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <Calculator size={25} className="text-gray-300" />
            <span className="text-base font-normal text-gray-300">
              Calculate
            </span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <CircleEllipsis size={25} className="text-gray-300" />
            <span className="text-base font-normal text-gray-300">more</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Room;
