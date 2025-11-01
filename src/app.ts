import express from 'express'
import cors from 'cors'
import {env} from './config/env.config'


import authRouter from './routes/auth.routes'

import { requestLogger } from './middlewares/requestLogger'
import { errorHandler } from './middlewares/errorHandler'

const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin:['http://localhost:5173'],
    credentials:true
}));

app.use(requestLogger);


app.use("/api/auth",authRouter)

app.get("/check",(req,res)=>{
    res.status(200).json({
        status:"ok",
        environment:env.NODE_ENV,
        message:"Server is running successfully"
    });
});

app.use(errorHandler);

export default app;