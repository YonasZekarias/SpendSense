import "dotenv/config";
import { createServer as createHttpServer } from "node:http";
import { createServer } from "./server";
import { attachSocketIO, registerInternalEmit } from "./socketio";
import { log } from "@repo/logger";

const port = Number(process.env.PORT ?? 3001);
const app = createServer();
const httpServer = createHttpServer(app);
const io = attachSocketIO(httpServer);
registerInternalEmit(app, io);

httpServer.listen(port, () => {
  log(`realtime (HTTP + Socket.io) on ${port}`);
});
