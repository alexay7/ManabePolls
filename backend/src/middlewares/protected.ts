// Middleware for protected routes
import {Request, Response, NextFunction} from "express";
import createHttpError from "http-errors";
import passport from "passport";
import {config} from "../config/config";

export function protectedRoute(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("jwt", {session: false}, function (err: unknown, user: { id: string }) {
        if (err) return next(createHttpError(401, err));
        if (!user) return next(createHttpError(401, "Unauthorized"));

        // Attach user to request object
        req.currentUser = user;

        next();
    })(req, res, next);
}

export function adminRoute(req: Request, res: Response, next: NextFunction) {
    return protectedRoute(req, res, () => {
        if (!req.currentUser || req.currentUser.id !== config.ADMIN_ID) {
            return next(createHttpError(401, "Unauthorized"));
        }

        return next();
    });
}