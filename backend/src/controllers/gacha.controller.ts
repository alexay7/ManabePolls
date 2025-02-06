import {NextFunction, Request, Response} from "express";
import {gachaService} from "../services/gacha.service";

export async function getUserCharacters(req: Request, res: Response, next: NextFunction) {
    try {
        const chars = await gachaService.getUserCharacters(req.params.userId!);

        return res.status(200).json({chars});
    } catch (error) {
        next(error);
    }
}

export async function pinCharacter(req: Request, res: Response, next: NextFunction) {
    const {id: userId} = req.currentUser!;

    const has = await gachaService.doUserHaveCharacter(userId, parseInt(req.params.charId));

    if (!has) {
        return res.status(404).json({message: "Character not found"});
    }

    await gachaService.pinCharacter(userId, parseInt(req.params.charId));

    return res.status(200).json({msg: "success"});
}

export async function unpinCharacter(req: Request, res: Response, next: NextFunction) {
    const {id: userId} = req.currentUser!;

    const has = await gachaService.doUserHaveCharacter(userId, parseInt(req.params.charId));

    if (!has) {
        return res.status(404).json({message: "Character not found"});
    }

    await gachaService.unpinCharacter(userId, parseInt(req.params.charId));

    return res.status(200).json({msg: "success"});
}

export async function yikesCharacter(req: Request, res: Response, next: NextFunction) {
    const {id: userId} = req.currentUser!;

    const has = await gachaService.doUserHaveCharacter(userId, parseInt(req.params.charId));

    if (!has) {
        return res.status(404).json({message: "Character not found"});
    }

    await gachaService.yikesCharacter(userId, parseInt(req.params.charId));

    return res.status(200).json({msg: "success"});
}

export async function unyikesCharacter(req: Request, res: Response, next: NextFunction) {
    const {id: userId} = req.currentUser!;

    const has = await gachaService.doUserHaveCharacter(userId, parseInt(req.params.charId));

    if (!has) {
        return res.status(404).json({message: "Character not found"});
    }

    await gachaService.unyikesCharacter(userId, parseInt(req.params.charId));

    return res.status(200).json({msg: "success"});
}