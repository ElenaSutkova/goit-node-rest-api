import Joi from "joi";

export const createContactSchema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email({minDomainSegments: 2}).required(),
})

export const updateContactSchema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email({minDomainSegments: 2}).required()
})