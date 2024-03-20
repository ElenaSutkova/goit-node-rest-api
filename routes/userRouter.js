import express from 'express';
import { registerUser, loginUser, logoutUser, updateAvatar } from '../controllers/usersControllers.js';
import validateBody from '../helpers/validateBody.js';
import { registrationSchema, loginSchema } from '../schemas/userSchemas.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { getCurrentUser } from '../controllers/usersControllers.js';
import { upload } from '../middleware/upload.js';
import { verifyUser, resendVerificationEmail } from '../controllers/usersControllers.js';

const usersRouter = express.Router();

usersRouter.post('/register', validateBody(registrationSchema), registerUser);
usersRouter.post('/login', validateBody(loginSchema), loginUser);
usersRouter.get('/current', authMiddleware, getCurrentUser);
usersRouter.post('/logout', authMiddleware, logoutUser);
usersRouter.patch('/avatars', authMiddleware, upload.single("avatar"), updateAvatar);
usersRouter.get('/verify/:verificationToken', verifyUser);
usersRouter.post('/verify', resendVerificationEmail);

export default usersRouter;