import {z} from "zod";

export const gachaUserEndpointParams = z.strictObject({
    userId: z.string()
});

export const gachaCharEndpointParams = z.strictObject({
    charId: z.string().refine((charId) => !isNaN(Number(charId)), {message: "El id del personaje debe ser un número"})
});