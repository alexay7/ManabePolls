import { NextFunction, Request, Response } from "express";
import { userService } from "../services/user.service";

export async function getUserTickets(req:Request,res:Response,next:NextFunction) {
    try{
        const tickets = await userService.getUserTickets(req.currentUser!.id);

        return res.status(200).json({tickets});
    }catch(error) {
        next(error);
    }
}