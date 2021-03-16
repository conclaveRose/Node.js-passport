"use strict";

const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../controller/auth'); //접근한 사용자가 로그인 했는지 안했는지를 체크하는 코드

// Welcome page
router.get('/', (req, res) => {
    res.render('welcome');
});

// Dashboard page    ->?????  라우트 메소드에 파라미터로 path와 뒤에는 어떤 목적으로 들어가는지 궁금?
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', {
        name: req.user.name //렌더링 화면에 유저의 이름을 띄워주기 위해서 dashboard.ejs 파일에 객체를 전달한다.
    });
});


module.exports = router;
