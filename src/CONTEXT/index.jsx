import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from 'socket.io-client';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const socketRef = useRef(null);
    
    
    useEffect(() => {
        socketRef.current = io('http://localhost:5000'); // Adjust the URL as needed
        return () => {
            socketRef.current.disconnect();
        };
    }, []);




    const value = {
        roomId,
        setRoomId,
        username,
        setUsername,
        socket: socketRef.current
       
    }

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
        
        
    

    
}

export const AllContext = () => useContext(UserContext);

