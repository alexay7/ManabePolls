import { Types } from 'mongoose';
import { z } from "zod";

type CreateVoteDtoType = {
    options: {
        option: Types.ObjectId;
        ticket:boolean
    }[]
}

export const createVoteDto:z.ZodType<CreateVoteDtoType> = z.strictObject({
    options: z.array(z.object({
        option: z.custom<Types.ObjectId>().refine((option) => Types.ObjectId.isValid(option), {message: "El id de la opción no es válido"}),
        ticket: z.boolean()
    }))
});