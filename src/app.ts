import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import {env} from './config/env.config'


import demorouter from './routes/demo.routes'
import authRouter from './routes/auth.routes'

import { requestLogger } from './middlewares/requestLogger'
import { errorHandler } from './middlewares/errorHandler'
import { corsOptions } from './config/cors.config'

const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors(corsOptions));
app.use(helmet())

app.use(requestLogger);


app.use("/api/v1/auth",authRouter)

app.get("/check",(req,res)=>{
    res.status(200).json({
        status:"ok",
        environment:env.NODE_ENV,
        message:"Server is running successfully"
    });
});

app.use(errorHandler);

export default app;