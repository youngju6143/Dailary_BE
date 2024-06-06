const express = require('express');

const authRouter = express.Router();
const authController = require('./authController'); 

// 회원가입 
authRouter.post('/signup', authController.signup);

// 로그인
authRouter.post('/login', authController.login);

module.exports = authRouter;
