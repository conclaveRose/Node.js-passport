"use strict";

const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../controller/auth');

// Welcome page
router.get('/', (req, res) => {
    res.render('welcome');
});

// Dashboard page    ->?????  라우트 메소드에 파라미터로 path와 뒤에는 어떤 목적으로 들어가는지 궁금?
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', {
        name: req.user.name
    });
});


module.exports = router;
