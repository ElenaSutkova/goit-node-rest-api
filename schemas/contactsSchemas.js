import Joi from "joi";

export const createContactSchema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.number().required(),
    email: Joi.string().email({minDomainSegments: 2}).required()
})

export const updateContactSchema = Joi.object({
    name: Joi.string(),
    phone: Joi.number(),
    email: Joi.string().email({minDomainSegments: 2}),
})