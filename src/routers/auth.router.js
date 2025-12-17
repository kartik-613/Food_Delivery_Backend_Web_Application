const express = require('express');
const { signUp, signIn, signOut, sendOtp, vrifyOtp, resetPassword, googleAuth } = require('../controllers/auth.controller');

const authRouter = express.Router();

authRouter.post('/signup', signUp);
authRouter.post('/signin', signIn);
authRouter.post('/signOut', signOut);
authRouter.post('/send-otp', sendOtp);
authRouter.post('/verify-otp',vrifyOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/google-auth', googleAuth);


module.exports = authRouter;