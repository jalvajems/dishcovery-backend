import "reflect-metadata";
import { env } from "./config/env.config";
import {connectDB} from './config/db.config';
import {log} from './utils/logger';
import app from './app'

(async ()=>{
    try {
        await connectDB();

        const port=env.PORT;
        
        app.listen(port,()=>{
            log.info(`Server running on port ${port} in ${env.NODE_ENV} node`)
        })
    } catch (error) {
        log.error("Server starting failed:", error)
        process.exit(1)
    }
})();