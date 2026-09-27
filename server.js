import app from "./src/app.js";
import logger from "./src/utils/logger.js";
import dbConnect from "./src/config/db.js";

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await dbConnect();

    app.listen(PORT, () => {
      logger.info(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    logger.error("Error starting the server:", error);
  }
};

startServer();
