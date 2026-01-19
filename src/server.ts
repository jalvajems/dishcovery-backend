import { env } from "./config/env.config";
import { connectDB } from './config/db.config';
import { log } from './utils/logger';
import app from './app'
import { redisClient } from "./config/redis.config";


import { createServer } from "http";
import { socketService } from "./services/implementation/socket.service";

(async () => {
    try {

        await connectDB();
        await redisClient.connect()

        const port = env.PORT;

        const httpServer = createServer(app);

        // Initialize Socket.io
        socketService.init(httpServer);

        httpServer.listen(port, () => {
            log.info(`Server running on port ${port} in ${env.NODE_ENV} node`);
        });

    } catch (error) {
        log.error("Server starting failed:", error)
        process.exit(1)
    }


})();
