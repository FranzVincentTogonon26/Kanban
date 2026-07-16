import { io } from "socket.io-client";
import { getToken } from "./api";

const URL = import.meta.env.VITE_SOCKET_URL;

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(URL, {
      autoConnect: false,
      auth: { token: getToken() },
      transports: ["websocket"],
    });
  }
  return socket;
};

export const connecSocket = () => {
  const socket = getSocket();
  socket.auth = { token: getToken() };
  if (!socket.connected) socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};
