const express = require('express');
const authRouter = require('./auth.router');
const userRouter = require('./user.router');



const mainRouter = express.Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/user', userRouter);

module.exports = mainRouter;