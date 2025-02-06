import {Router} from "express";
import {
    getUserCharacters,
    pinCharacter,
    unpinCharacter,
    unyikesCharacter,
    yikesCharacter
} from "../controllers/gacha.controller";
import {customValidateRequest} from "../helpers/zod";
import {gachaCharEndpointParams, gachaUserEndpointParams} from "../dto/gacha.dto";
import {protectedRoute} from "../middlewares/protected";

const gachaRouter = Router();

gachaRouter.get("/:userId",
    customValidateRequest({
        params: gachaUserEndpointParams
    }),
    getUserCharacters);

gachaRouter.post("/char/:charId/pin",
    protectedRoute,
    customValidateRequest({
        params: gachaCharEndpointParams
    }),
    pinCharacter);

gachaRouter.post("/char/:charId/unpin",
    protectedRoute,
    customValidateRequest({
        params: gachaCharEndpointParams
    }),
    unpinCharacter);

gachaRouter.post("/char/:charId/yikes",
    protectedRoute,
    customValidateRequest({
        params: gachaCharEndpointParams
    }),
    yikesCharacter);

gachaRouter.post("/char/:charId/unyikes",
    protectedRoute,
    customValidateRequest({
        params: gachaCharEndpointParams
    }),
    unyikesCharacter);

export default gachaRouter;