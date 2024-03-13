import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/usersControllers.js';
import validateBody from '../helpers/validateBody.js';
import { registrationSchema, loginSchema } from '../schemas/userSchemas.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { getCurrentUser } from '../controllers/usersControllers.js';

const usersRouter = express.Router();

usersRouter.post('/register', validateBody(registrationSchema), registerUser);
usersRouter.post('/login', validateBody(loginSchema), loginUser);
usersRouter.get('/current', authMiddleware, getCurrentUser);
usersRouter.post('/logout', authMiddleware, logoutUser);

export default usersRouter;