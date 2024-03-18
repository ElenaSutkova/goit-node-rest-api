import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from '../models/user.js';
import HttpError from "../helpers/HttpError.js";
import 'dotenv/config';
import path from "path";
import gravatar from "gravatar";
import fs from "fs/promises";
import Jimp from "jimp"

const avatarsDir = path.resolve('public', 'avatars');

export const registerUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            throw HttpError(409, "Email in use");
        }
        const avatarURL = gravatar.url(email, {protocol: 'https', s: '250'})
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL });
        res.status(201).json(
            {
                "users": {
                    email: newUser.email,
                    subscription: newUser.subscription,
                }
            }
        )
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
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw HttpError(401, 'Email or password is wrong');
        }

        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
            },
            process.env.JWT_SECRET,
            { expiresIn: 60 * 60 }
        );

        await User.findByIdAndUpdate(user._id, { token });

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
        throw HttpError(204);
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
            throw HttpError(400, "please add your file")
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
}