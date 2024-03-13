import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import HttpError from '../helpers/HttpError.js';

const { JWT_SECRET } = process.env;

const authMiddleware = async (req, res, next) => {
    try {
        const { authorization = "" } = req.headers;
        const [bearer, token] = authorization.split(" ");
        if (bearer !== "Bearer") {
            throw HttpError(401)
        }

        try {
            const { id } = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(id);
            if (!user || user.token !== token) {
                throw HttpError(401)
            }

            req.user = user;
            next();
        }
        catch (error) {
            next(HttpError(401, "Not authorized"));
        }
    } catch (error) {
        next(error)
    }
};

export default authMiddleware;