import express, {json, urlencoded} from "express";
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
import userRouter from "./routes/user.routes";
import {config} from "./config/config";
import gachaRouter from "./routes/gacha.routes";

// configures dotenv to work in your application
const app = express();

// Initialize DB
connectDB();

// Initialization
app.use(json());
app.use(urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({origin: ["http://localhost:5173", config.FRONTEND_URL], credentials: true}));

app.use(session({secret: config.SESSION_SECRET, resave: false, saveUninitialized: false}));

app.use(passport.initialize());
app.use(passport.session());

// Passport
passport.use(
    new JwtStrategy({
        jwtFromRequest: (req) => {
            // Get from authorization header
            if (req.headers.authorization) {
                return req.headers.authorization.split(" ")[1];
            }
        },
        secretOrKey: config.SESSION_SECRET,
        passReqToCallback: true
    },
    (req, jwtPayload, done) => {
        if (Date.now() > jwtPayload.exp * 1000) {
            return done("Expired token", null);
        }

        return done(null, jwtPayload);
    })
);

// Controllers
app.use("/discord", discordController);
app.use("/polls", pollRouter);
app.use("/votes", voteRouter);
app.use("/user", userRouter);
app.use("/gacha", gachaRouter);

app.use(function (req, res, next) {
    next(createHttpError(404, "Not Found"));
});

// Error Handler
app.use(errorMiddleware);

app.listen(config.PORT, () => {
    console.log("Server running at PORT: ", config.PORT);
}).on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message);
});

const globalErrorHandler = function (err: Error): void {
    console.error("Uncaught Exception", err);
};

process.on("unhandledRejection", globalErrorHandler);
process.on("uncaughtException", globalErrorHandler);