import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

import { createContext, useState, useEffect, useContext } from "react";

export const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      const socket = io(import.meta.env.VITE_SOCKET_URL, {
        transports: ["websocket"],
        query: {
          userId: authUser._id,
        },
      });

      setSocket(socket);
      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
        // console.log("onlineUsers", onlineUsers);
      });
      return () => {
        socket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
