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
        const verificationToken = uuid(); 
        const newUser = new User({ email, password: hashPassword, avatarURL, verificationToken });
        await newUser.save();
        await sendVerificationEmail(newUser.email, newUser.verificationToken);
        res.status(201).json({ user: {email: newUser.email, subscription: newUser.subscription}})
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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        user.token = token;

        await User.findByIdAndUpdate({ verificationToken }, { verify: true, verificationToken: null });

        res.json({
            token,
            user: {
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
        req.user.token = null;
        await User.findOneAndUpdate(
            { verificationToken },
            { verify: true, verificationToken: null }
        );
        res.status(204).end()
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
        if (!req.file) {
            throw HttpError(400, 'Avatar file is required');
        }
        const userId = req.user._id;
        const { filename } = req.file;
        const user = await User.findById(userId);
        
        if (!user) {
            throw HttpError(404, 'User not found')
        }

        const img = await Jimp.read(req.file.path);
        await img.cover(250, 250).writeAsync(req.file.path);

        const avatarPath = `public/avatars/${filename}`;
        const avatarURL = `avatars/${filename}`;

        await fs.rename(req.file.path, avatarPath);
        user.avatarURL = avatarURL;
        await User.findOneAndUpdate(
            { verificationToken },
            { verify: true, verificationToken: null }
        );
        res.status(200).json({ avatarURL });
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

        user.verify = true;
        user.verificationToken = null;
        await User.findOneAndUpdate(
            { verificationToken },
            { verify: true, verificationToken: null }
        );
        res.status(200).json({ message: 'Verification successful' })
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