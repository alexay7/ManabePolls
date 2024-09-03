import { Router } from "express";
import { createOptionDto, createPollDto, pollEndpointParams, pollOptionEndpointParams, pollTypeEndpointParams} from "../dto/poll.dto";
import { activatePoll, addOptionToPoll, createPoll, deleteOptionFromPoll, getActivePolls, getPolls } from "../controllers/poll.controller";
import { customValidateRequest } from "../helpers/zod";
import { adminRoute } from "../middlewares/protected";

const pollRouter = Router();

pollRouter.get("/", getPolls);
pollRouter.post("/create",
    customValidateRequest({
        body: createPollDto,
    }),
    adminRoute,
    createPoll
);
pollRouter.get("/active",getActivePolls);
pollRouter.put("/:pollId/:type/options", 
    adminRoute,
    customValidateRequest({
        body: createOptionDto,
        params: pollTypeEndpointParams
    }),
    addOptionToPoll
);
pollRouter.patch("/:pollId/activate",
    adminRoute,
    customValidateRequest({
        params: pollEndpointParams
    }),
    activatePoll
);
pollRouter.delete("/:pollId/:type/options/:optionName", 
    adminRoute,
    customValidateRequest({
        params: pollOptionEndpointParams
    }),
    deleteOptionFromPoll
);


export default pollRouter;