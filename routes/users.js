"use strict";

const express = require('express');
const router = express.Router();
const ctrl = require('../controller/ctrl.user');


//로그인 페이지 랜더링
router.get('/login', (req, res) => {
    res.render('login');
});


//회원가입 페이지 랜더링
router.get('/register', (req, res) => {
    res.render('register');
});


//회원가입 핸들러  (Create)
router.post('/register', ctrl.process.register);


//로그인 핸들러 ( Read )
router.post('/login', ctrl.process.login);


// 로그아웃 핸들러 
router.get('/logout', ctrl.process.logout);


module.exports = router;


