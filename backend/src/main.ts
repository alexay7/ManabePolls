import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import connectDB from "./db";
import errorMiddleware from "./middlewares/errors";
import cookieParser from "cookie-parser";
import createHttpError from "http-errors";
import cors from "cors";
import discordController from "./controllers/discord.controller";
import passport from "passport";
import {Strategy as JwtStrategy} from "passport-jwt";
import pollRouter from "./routes/poll.routes";
import session from "express-session";
import voteRouter from "./routes/vote.routes";

// configures dotenv to work in your application
dotenv.config();
const app = express();

// Initialize DB
connectDB();

// Initialization
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(session({secret: process.env.SESSION_SECRET as string, resave: false, saveUninitialized: false}));

app.use(passport.initialize());
app.use(passport.session());

// Passport
passport.use(
    new JwtStrategy({
        jwtFromRequest:(req)=>{
            // Get from authorization header
            if(req.headers.authorization){
                return req.headers.authorization.split(" ")[1];
            }
        },
        secretOrKey:process.env.SESSION_SECRET as string,
        passReqToCallback:true
    },
    (req,jwtPayload, done) => {
        if(Date.now() > jwtPayload.exp*1000){
            return done("Expired token",null);
        }

        return done(null, jwtPayload);
    })
);

// Controllers
app.use("/discord",discordController);
app.use("/polls", pollRouter);
app.use("/votes",voteRouter);

app.use(function(req, res, next) {
    next(createHttpError(404,"Not Found"));
});

// Error Handler
app.use(errorMiddleware);

app.listen(process.env.PORT, () => { 
    console.log("Server running at PORT: ", process.env.PORT); 
}).on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message);
});

const globalErrorHandler = function(err: Error): void {
    console.error("Uncaught Exception", err);
};

process.on("unhandledRejection", globalErrorHandler);
process.on("uncaughtException", globalErrorHandler);