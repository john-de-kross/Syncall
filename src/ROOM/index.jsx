import { ChevronDown, ChevronLeft, ShieldCheck, SwitchCamera, Volume2 } from "lucide-react";
import React from "react";



const Room = () => {
    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
            <div className="flex items-center justify-between px-2 md:px-4 h-20 md:h-40 bg-gradient-to-r from-slate-700 lg:hidden via-black to-gray-900">
                <div className="flex items-center gap-3 md:gap-7">
                    <ChevronLeft size={30} className="text-gray-200 md:h-14 md:w-14" />
                    <SwitchCamera size={30} className="text-gray-300 md:h-14 md:w-14" />
                    <Volume2 size={30} className="text-gray-300 md:h-14 md:w-14" />
                </div>

                <div className="flex items-center justify-center gap-1 pr-9">
                    <ShieldCheck size={30} fill="green" className="md:h-14 md:w-14"/>
                    <span className="text-gray-200 font-medium text-lg md:text-4xl">Syncall</span>
                    <ChevronDown size={30} className="text-gray-300 md:h-14 md:w-14" />
                </div>
                <div className="bg-red-500 h-6 w-6 rounded md:h-8 md:w-8">


                </div>


            </div>



            

        </div>
        
    )

}
export default Room;