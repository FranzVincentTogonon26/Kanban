import http from "http";

import app from "./app.js";
import { ENV } from "./config/env.js";
import { initSocket } from "./socket/socket.io.js";

const server = http.createServer(app);
initSocket(server);

server.listen(ENV.PORT, () => {
  console.log(`🌐 API + 🔌 Socket.IO listening on port: ${ENV.PORT}`);
});
