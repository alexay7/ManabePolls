import { Types } from "mongoose";
import { z } from "zod";
import { OptionType, PollType } from "../types/polls";

export const createPollDto:z.ZodType<Pick<PollType,"month"|"year">> = z.strictObject({
    month: z.enum(["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],{message: "El mes debe ser uno de los 12 meses del año"}),
    year: z.string().refine((year) => year.length === 4, {message: "El año debe tener 4 dígitos"}).refine((year) => !isNaN(Number(year)), {message: "El año debe ser un número"}).refine((year) => Number(year) >= new Date().getFullYear(), {message: "El año debe ser mayor o igual al actual"}),
});

export const createOptionDto:z.ZodType<Omit<OptionType,"_id">> = z.strictObject({
    name: z.string().min(1),
    imageUrl: z.string().min(1).url(),
    description: z.string().min(1),
    links: z.array(z.object({
        name: z.string().min(1),
        url: z.string().min(1).url()
    })),
    difficulty: z.string().optional(),
    proposer: z.string().min(1),
});

export const pollEndpointParams = z.strictObject({
    pollId:z.string().refine((pollId) => Types.ObjectId.isValid(pollId), {message: "El id de la encuesta no es válido"})
});

export const pollTypeEndpointParams = z.strictObject({
    type:z.enum(["anime","manga","novel","vn","live"])
}).merge(pollEndpointParams);

export const pollOptionEndpointParams = z.strictObject({
    optionName:z.string().min(1)
}).merge(pollTypeEndpointParams);