import "dotenv/config";
import app from "./app";
import logger from "./lib/logger";

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  logger.info({ port: PORT }, `Server running on port ${PORT}`);
});
