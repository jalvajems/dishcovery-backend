import express from 'express'
import cors from 'cors'
import {env} from './config/env.config'
import cookieParser from 'cookie-parser'



import authRouter from './routes/auth.routes'
import adminRouter from './routes/admin.routes'

import { requestLogger } from './middlewares/requestLogger'
import { errorHandler } from './middlewares/errorHandler'
import { STATUS_CODE } from './constants/StatusCode'

const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.use(cors({
    origin:['http://localhost:5173'],
    credentials:true
}));

app.use(requestLogger);


app.use("/api/auth",authRouter)
app.use("/api/admin",adminRouter)

app.get("/check",(req,res)=>{
    res.status(STATUS_CODE.SUCCESS).json({
        status:"ok",
        environment:env.NODE_ENV,
        message:"Server is running successfully"
    });
});

app.use(errorHandler);

export default app;