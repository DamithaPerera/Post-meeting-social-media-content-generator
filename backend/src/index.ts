import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import "./services/scheduler.js"; // start cron workers

app.listen(env.PORT, () => {
  logger.info(`API running on http://localhost:${env.PORT}`);
});
