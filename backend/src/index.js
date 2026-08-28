import express, { application } from "express";
import "dotenv/config";
import cors from "cors";
import fs from "fs";
import path from "path";
import { clerkMiddleware } from '@clerk/express'

import User from "./models/user.model.js";
import connectDB from "./lib/db.js";
import job from "./lib/cron.js";
import { json } from "stream/consumers";

const app = express();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const publicDir = path.join(process.cwd(), "public");

//it's important that you don't parse the webhook event data, it should be in the raw format
app.use("/api/webhooks/clerk",express.raw({type:"application/json"}),clerkwebhook)
app.use(express.json());
app.use(cors({origin:FRONTEND_URL , credentials:true}));
app.use(clerkMiddleware());

app.get("/health" , (req , res)=> {
    res.status(200).json({ ok : true });
});
//If the public directory exist, serve the static files
//this is for the producion build
if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir));

    app.get("/{*any}", (req,res,next)=>{
        res.sendFile(path.join(publicDir, "index.html"), (err)=> next(err));
    });
}
app.listen(PORT, ()=>{
    connectDB();
    console.log("Server is running on port: ",PORT);

    if(process.env.NODE_ENV === "production") job.start();
}); 


