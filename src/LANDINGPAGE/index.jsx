
import React from "react";
import { Copy, Link, Phone } from "lucide-react";

const LandingPage = () => {
    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-blue-400 to-blue-900  flex items-center justify-center md:bg-slate-700 md:bg-none md:from-none md:to-none">
            <div className="w-full h-full md:w-[60%] md:h-[75vh] md:bg-gradient-to-br md:from-slate-600 md:via-slate-700 md:to-indigo-500 md:grid md:py-7 md:grid-cols-2 md:rounded-lg md:shadow-lg">
                <div className="h-[40vh] md:w-[90%] md:h-[65vh] text-white text-sm shadow-lg shadow-black rounded-r-[20%] bg-gradient-to-b from-blue-400 to-blue-900">
                    <h1 className="text-2xl mb-4 font-bold py-2">Welcome to Syncall</h1>
                    <p className="text-lg font-light text-gray-100">The ultimate video call app</p>
                    <p className="text-lg font-light text-gray-100">Enjoy your seamless communication with family & friends.</p>
                    <div className="hidden md:flex md:items-center md:justify-center md:h-60 md:mt-3 md:w-full ">
                        <img className="h-full" src="/video-call.png" alt="video-call" />
                        
                    </div>
                </div>
                <div className="w-full mt-3 md:w-[80%] md:h-[60vh] flex flex-col place-items-center md:items-start">
                    <h1 className="font-bold text-white text-2xl md:text-3xl mb-4">Create & Invite</h1>
                    <p className="text-gray-200 text-base">Start your call instantly</p>
                    <p className="text-gray-200 text-base">No login, no delay</p>

                    <form action="" className="md:mt-7 mt-3 px-3  space-x-2 space-y-2 w-full md:px-0 md:space-x-0 md:space-y-4 flex flex-col items-start ">
                        <label htmlFor="" className="text-gray-300 text-base md:text-lg mb-1">
                            Username
                        </label>
                        <input
                            className="outline-none border text-white p-2 w-full h-9 md:h-8 bg-gradient-to-r from-gray-700 to-gray-900 border-gray-500 rounded-lg"
                            type="text"
                            placeholder="'eg: Michael' "
                        />
                        <label htmlFor="" className="text-gray-300 text-base md:text-lg mb-1 ">
                            Unique ID
                        </label>
                        <input
                            className="outline-none relative border text-white p-2 w-full h-9 md:h-8 bg-gradient-to-r from-gray-700 to-gray-900 border-gray-500 rounded-lg"
                            type="text"
                            placeholder="abc12345"
                        />
                        < Copy className="absolute mt-28 md:mt-30 w-4 h-4 right-[20%] md:cursor-pointer text-gray-200 md:right-[30%]" />
                        <p className="text-xs w-full flex justify-center text-gray-400 px-4">Tip: Unique ID is automatically copied</p>
                        <div className="btn w-full flex flex-col place-items-center gap-4 md:justify-between md:gap-4">
                            <button className="flex justify-center gap-3 items-center font-normal md:font-medium text-gray-100 shadow rounded-xl shadow-slate-900 bg-blue-950 w-[60%] md:w-[70%] h-9 md:rounded-2xl">
                                < Phone className="text-black fill-black"/>
                                Create Room
                            </button>
                            <button className="flex justify-center items-center gap-3 font-normal md:font-medium text-gray-100 rounded-xl shadow shadow-slate-900 bg-blue-950 w-[60%] md:w-[70%] h-9 md:rounded-2xl">
                                <Link className="text-black "/>
                                Join Room
                            </button>

                        </div>
                    </form>

                </div>
                

            </div>
            
        </div>
    );
}

export default LandingPage;