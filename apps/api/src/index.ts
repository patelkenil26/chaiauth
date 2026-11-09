import http from "node:http";
import { logger } from "@repo/logger";
import { app as expressApplication } from "./server";

import { config } from "./common/config/env.config";

async function init() {
  try {
    const server = http.createServer(expressApplication);
    const PORT: number = config.app.port;
    server.listen(PORT, () => {
      logger.info(`http server is running on PORT ${PORT}`);
    });
  } catch (err) {
    logger.error(`Error creating http server`, { err });
    process.exit(1);
  }
}

init();
