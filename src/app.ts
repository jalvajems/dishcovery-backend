import express from 'express'
import cors from 'cors'
import { env } from './config/env.config'
import cookieParser from 'cookie-parser'



import authRouter from './routes/auth.routes'
import adminRouter from './routes/admin.routes'
import foodieRouter from './routes/foodie.routes'
import chefRouter from './routes/chef.routes'
import fileRouter from './routes/file.routes'
import workshopRouter from './routes/workshop.routes'
import bookingRouter, { webhookRouter } from './routes/booking.routes'
import sessionRouter from './routes/session.routes'
import followRouter from './routes/follow.routes'
import chatRouter from './routes/chat.routes'
import aiRouter from './routes/ai.routes'


import { requestLogger } from './middlewares/requestLogger'
import { errorHandler } from './middlewares/errorHandler'
import { STATUS_CODE } from './constants/StatusCode'

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://dishcovery-app.jalva.online',
    'https://dishcovery.app.jalva.online',
    'https://dishcovery.jalva.online',
    'https://jalva.online',
    process.env.CLIENT_URL,
    process.env.BASE_URL
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
            return callback(null, true);
        }
        // Allow subdomains of jalva.online dynamically
        if (/^https?:\/\/([a-z0-9-]+\.)*jalva\.online$/.test(origin)) {
            return callback(null, true);
        }
        return callback(null, true); // Fallback allow origin in development/production if matching
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use('/api/bookings', webhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(requestLogger);


import notificationRouter from './routes/notification.routes'

app.use("/api/auth", authRouter)
app.use("/api/admin", adminRouter)
app.use("/api/foodie", foodieRouter)
app.use("/api/chef", chefRouter)
app.use("/api/file", fileRouter)
app.use("/api/workshop", workshopRouter)
app.use("/api/bookings", bookingRouter)
app.use("/api/sessions", sessionRouter)
app.use("/api/follow", followRouter)
app.use("/api/notifications", notificationRouter)
app.use("/api/chat", chatRouter)
app.use("/api/ai", aiRouter)

app.get("/check", (req, res) => {
    res.status(STATUS_CODE.SUCCESS).json({
        status: "ok",
        environment: env.NODE_ENV,
        message: "Server is running successfully"
    });
});

app.use(errorHandler);

export default app;