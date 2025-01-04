import { Router } from "express";
import { getUserTickets } from "../controllers/user.controller";
import { protectedRoute } from "../middlewares/protected";

const userRouter = Router();

userRouter.get("/tickets", 
    protectedRoute,
    getUserTickets);

export default userRouter;