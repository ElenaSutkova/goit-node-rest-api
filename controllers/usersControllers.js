import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from '../models/user.js';
import HttpError from "../helpers/HttpError.js";
import 'dotenv/config';
import path from "path";
import gravatar from "gravatar";
import fs from "fs/promises";
import Jimp from "jimp"
import { sendVerificationEmail } from "../services/emailServices.js";
import { uuid } from 'uuidv4';

const avatarsDir = path.resolve("public", "avatars");
const { JWT_SECRET } = process.env;

export const registerUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            throw HttpError(409, "Email in use");
        }
        const avatarURL = gravatar.url(email, {protocol: 'https', s: '250'})
        const hashPassword = await bcrypt.hash(password, 10);
        const verificationToken = uuid(); 
        const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, verificationToken });
        await newUser.save();
        await sendVerificationEmail(newUser.email, newUser.verificationToken);
        res.status(201).json({ "users": {email: newUser.email, subscription: newUser.subscription}})
    }
    catch (error) {
        next(error)
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            throw HttpError(401, 'Email or password is wrong');
        }
        if (!user.verify) {
            throw HttpError(401, "Email not verified")
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw HttpError(401, 'Email or password is wrong');
        }
        const payload = {
            id: user._id
        }
        console.log(JWT_SECRET)

        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "1h"})

        await User.findOneAndUpdate(user._id, { token });

        res.json({
            token,
            "users": {
                email: user.email,
                subscription: user.subscription,
            }
        });
    } catch (error) {
        next(error)
    }
};

export const logoutUser = async (req, res, next) => {
    try {
        const { _id } = req.user;
        await User.findOneAndUpdate(_id, { token: '' });
        throw HttpError(204)
    } catch (error) {
        next(error)
    }
};

export const getCurrentUser = async (req, res, next) => {
    try {
        const { email, subscription } = req.user;
        res.json({
            email,
            subscription,
        })
    } catch (error) {
        next(error)
    }
};

export const updateAvatar = async (req, res, next) => {
    try {
        const { _id } = req.user;
        if (!req.file) {
            throw HttpError(400, "Please add your file")
        }
        const { path: tempUpload, originalname } = req.file;
        const filename = `${_id}_${originalname}`;
        const resultUpload = path.join(avatarsDir, filename);

        const img = await Jimp.read(tempUpload);
        await img.resize(250, 250).quality(60).write(tempUpload);

        await fs.rename(tempUpload, resultUpload);
        const avatarURL = path.join("avatars", filename);
        await User.findByIdAndUpdate(_id, { avatarURL });
        res.json({
            avatarURL
        })
    } catch (error) {
        next(error)
    }
};

export const verifyUser = async (req, res, next) => {
    try {
        const { verificationToken } = req.params;
        const user = await User.findOne({ verificationToken });
        
        if (!user) {
            throw HttpError(404, 'User not found')
        }

        await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });
        res.status(200).json({
            message: "Verification successful"
        })
    } catch (error) {
        next(error)
    }
};

export const resendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            throw HttpError(404, 'User not found')
        }

        if (user.verify) {
            throw HttpError(400, 'Verification has already been passed')
        }

        await sendVerificationEmail(user.email, user.verificationToken);

        res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        next(error)
    }
};