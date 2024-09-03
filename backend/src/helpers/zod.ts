import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { RequestValidation } from 'zod-express-middleware';
import { fromError } from 'zod-validation-error';
import { makeHandler } from 'express-ts-handler';
import { z, ZodSchema } from 'zod';

export const customValidateRequest = <TParams = unknown, TQuery = unknown, TBody = unknown>(schemas: RequestValidation<TParams, TQuery, TBody>):RequestHandler<TParams, unknown, TBody, TQuery> => {

    return function(req,res,next) {
        const errors = [];
        if (schemas.body) {
            const parsedBody = schemas.body.safeParse(req.body);

            if(!parsedBody.success){
                const bodyValidationError = fromError(parsedBody.error);
                errors.push(bodyValidationError.toString());
            }
        }

        if (schemas.query) {
            const parsedQuery = schemas.query.safeParse(req.query);

            if(!parsedQuery.success){
                const queryValidationError = fromError(parsedQuery.error);
                errors.push(queryValidationError.toString());
            }
        }

        if (schemas.params) {
            const parsedParams = schemas.params.safeParse(req.params);

            if(!parsedParams.success){
                const paramsValidationError = fromError(parsedParams.error);
                errors.push(paramsValidationError.toString());
            }
        }

        if(errors.length>0){
            next(createHttpError(400,errors.join(", ")));
        }

        return next();
    };

};

export const handler = makeHandler<ZodSchema>({
    parse: (type, value) => type.parse(value),
    object: z.object,
});