import { Types } from 'mongoose';
import { VoteType } from './../types/vote.d';
import { z } from "zod";

export const createVoteDto:z.ZodType<Pick<VoteType,"options">> = z.strictObject({
    options: z.array(z.custom<Types.ObjectId>().refine((option) => Types.ObjectId.isValid(option), {message: "El id de la opción no es válido"}))
});