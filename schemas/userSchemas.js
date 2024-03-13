import { Schema, model } from "mongoose";
import Joi from "joi";
import { handleMongooseError } from "../helpers/handleMongooseError.js";

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Set email for contact'],
            unique: true,
        },
        password: {
            type: String,
            minLength: 6,
            required: [true, 'Set password for contact'],
        },
        subscription: {
            type: String,
            enum: ['starter', 'pro', 'business'],
            default: 'starter',
        },
        token: {
            type: String,
            default: '',
        },
        avatarURL: {
            type: String,
            required: true,
        },
        verify: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            required: [true, 'Verify token is required'],
        },
    },
    { versionKey: false, timestamps: true }
);

userSchema.post('save', handleMongooseError);

export const registrationSchema = Joi.object({
    password: Joi.string().min(4).required(),
    email: Joi.string().email().required(),
    subscription: Joi.string()
});

export const loginSchema = Joi.object({
    password: Joi.string().min(4).required(),
    email: Joi.string().email().required(),
});

export const emailSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().min(6).required(),
});

const schemas = {
    registrationSchema,
    loginSchema,
    emailSchema,
};

const User = model('user', userSchema);

export default {
    User,
    schemas,
};