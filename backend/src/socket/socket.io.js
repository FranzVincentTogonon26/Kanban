import { Server } from "socket.io";

import { ENV } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import jwtToken from "../utils/jwt.js";
import SocketIO from "../models/socet.io.model.js";
import { boardRoom, setIO } from "../realtime/index.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ENV.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw ApiError.unauthorized("Authentication required");

      const decoded = jwtToken.verify(token);
      socket.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
      };
      socket.data.user = socket.user;

      next();
    } catch (err) {
      if (err.isApiError) return next(err);
      next(ApiError.unauthorized("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { user } = socket;

    socket.on("board:join", async (boardId, ack) => {
      try {
        const userAccess = await SocketIO.userCanAccessBoard(user.id, boardId);
        if (!userAccess) {
          if (ack) ack({ ok: false, error: "No access to this board" });
          return;
        }

        const room = boardRoom(boardId);
        socket.join(room);

        socket.to(room).emit("presence:join", {
          user: { id: user.id, name: user.name },
          boardId,
        });

        const sockets = await io.in(room).fetchSockets();
        const seen = new Set([user.id]);
        const viewers = [];

        for (const s of sockets) {
          const u = s.data?.user;

          if (!u || seen.has(u.id)) continue;
          seen.add(u.id);
          viewers.push({ id: u.id, name: u.name });
        }

        socket.emit("presence:sync", { boardId, users: viewers });
        if (ack) ack({ ok: true });
      } catch (err) {
        if (ack) ack({ ok: false, error: "Failed to join board" });
      }
    });

    socket.on("board:leave", (boardId) => {
      socket.leave(boardRoom(boardId));
      socket.to(boardRoom(boardId)).emit("presence:leave", {
        user: { id: user.id, name: user.name },
        boardId,
      });
    });

    socket.on("presence:cursor", ({ boardId, x, y }) => {
      socket.to(boardRoom(boardId)).emit("presence:cursor", {
        user: { id: user.id, name: user.name },
        x,
        y,
      });
    });

    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room === socket.id) continue;
        socket.to(room).emit("presence:leave", {
          user: { id: user.id, name: user.name },
        });
      }
    });
  });

  setIO(io);
  return io;
};
