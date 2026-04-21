import { createServer } from "./server";
import { log } from "@repo/logger";

const DEFAULT_PORT = 3001;
const MAX_PORT_ATTEMPTS = 10;
const requestedPort = Number(process.env.PORT ?? DEFAULT_PORT);
const app = createServer();

function startServer(port: number, attempt = 1): void {
  const httpServer = app.listen(port, () => {
    log(`api running on ${port}`);
  });

  httpServer.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE" && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      log(`port ${port} is in use, retrying on ${nextPort}`);
      startServer(nextPort, attempt + 1);
      return;
    }

    throw error;
  });
}

startServer(requestedPort);
