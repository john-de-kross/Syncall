import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [roomId, setRoomId] = useState('');


    const value = {
        roomId,
        setRoomId
    }

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
        
        
    

    
}

export const AllContext = () => useContext(UserContext);

