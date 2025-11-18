import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter=nodemailer.createTransport({
    secure:true,
    host:process.env.SMTP_HOST,
    port:465,
    auth:{
        user:'pjalva90@gmail.com',
        pass:'pfsm ctls ukvq efjm'
    }
})
export function sendMail(to:string,sub:string,otp:string){
    transporter.sendMail({
        to:to,
        subject:sub,
        html:otp
    })
    logger.info('email sent')
}

