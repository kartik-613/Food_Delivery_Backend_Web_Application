const express = require('express');
const { isAuth } = require('../middlewares/auth.middleware');
const { getCurrentUser } = require('../controllers/user.controller');


const userRouter = express.Router();

 userRouter.get('/current',isAuth ,  getCurrentUser);

module.exports = userRouter;