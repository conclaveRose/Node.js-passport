"use strict";

//모듈
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

//Passport.js를 불러온다. (passport를 인자로 passport.js파일로 전달하고 그것을 다시 받아온다. )
require('./controller/passport')(passport);


//dotenv를 요청한다. (외부로 유출되면 안되는 것을 관리하는 파일이다.)
require('dotenv').config({ path: '.env' });

// 몽고DB 연결
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }, () => {
    console.log('DB에 연결됨');
})

// bodyParser 사용 (req.body의 데이터를 parsing하기위해 필요함)
app.use(bodyParser.urlencoded({ extended: false }));

//Express Session 미들웨어 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//Passport middleware 패스포트 미들웨어 
app.use(passport.initialize());
app.use(passport.session());

//Connect flash (flash의 경우 내부적으로 session이용하고 있기 때문에 반드시 session 미들웨어 다음에 정의해 줘야 한다!!!!!!!!!!)
app.use(flash());

//Global Vars 전역변수
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();  //flash?와 관계가 있는건가 ? 정확한 사용법은? 
});



//EJS 셋팅
app.use(expressLayouts);
app.set('view engine', 'ejs');


//라우팅 미들웨어 
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


//3000번 포트 서버 가동
app.listen(3000, () => {
    try {
        console.log('서버 실행');
    } catch (error) {
        console.log('연결 불가');
    }
});