"use strict";

const express = require('express');
const router = express.Router();
const User = require('../models/userStorage');// 스키마 모델을 가져온다.
const bcrypt = require('bcryptjs'); //비번 암호화 모듈
const passport = require('passport');

//로그인 페이지 랜더링
router.get('/login', (req, res) => {
    res.render('login');
});


//회원가입 페이지 랜더링
router.get('/register', (req, res) => {
    res.render('register');
});



//회원가입 핸들러  (Create)
router.post('/register', (req, res) => {
    // console.log(req.body);
    const { name, email, password, password2 } = req.body; //회원가입 페이지에서 클라이언트가 입력한 정보를 각각의 이름으로 할당해 준다. 
    let errors = [];

    // Check required fields (필수 항목 체크 검사 )
    if (!name || !email || !password || !password2) {
        errors.push({ msg: '공백 없이 정보를 입력하시오.' });
    }; //만약 하나라도 공백이 있을 시 errors 배열에 msg 문구가 들어있는 객체를 집어 넣는다. 

    //Check password match (두 비밀번호란이 서로 일치하는지 체크 )
    if (password !== password2) {
        errors.push({ msg: '비밀번호가 일치하지 않습니다.' });
    };

    //Check password length (비밀번호 길이 체크 )
    if (password.length < 6) {
        errors.push({ msg: "비밀번호는 6자리 이상이어야 합니다." });
    };

    // 위의 if조건중 하나라도 만족하는 것이 있으면 (즉 ,회원정보 입력이 뭔가 하나 잘못 입력 되었다면 )
    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else { //위의 조건문에 다 걸리지 않고 회원정보를 정상적으로 입력했을 때  
        // 데이터베이스에(User) 이미 있는 데이터 인지를 확인하는 절차를 거쳐야 한다. 
        User.findOne({ email: email })   //데이터베이스에 저장된 회원의 email이 이미 있는지를 확인한다. 
            .then(user => {  //만약 DB에 이미 있는 메일 주소라면 
                if (user) {
                    errors.push({ msg: "이미 존재하는 주소입니다." });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {  //DB에 입력한 메일 주소가 존재하지 않는다면 
                    const user = new User({
                        name,
                        email,
                        password,
                    });

                    // Hash Password (비밀번호 암호화 )
                    //bcrypt.genSalt를 이용하여 솔트를 만든다. 
                    //앞에서 10은 문자의 수를 의미하고
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(user.password, salt, (err, hash) => {
                            if (err) throw err;
                            //Set password to hashed   암호를 해시로 설정
                            user.password = hash;
                            //Save user 
                            user.save()
                                .then(user => {
                                    req.flash('success_msg', '정상적으로 회원가입 되었습니다. 로그인하여 접속하세요');
                                    res.redirect('/users/login')
                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            });
    }
});


//로그인 핸들러 ( Read )
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { //고객이 로그인 form에서 전달하는 정보(아이디,패스워드)를 passport가 받게끔 하는 것. -> 패스포트 전략은 로컬전략을 사용하겠다. 
        successRedirect: '/dashboard',  //고객이 입력한 로그인 정보가 데이터베이스 정보와 일치할 경우 대시보드 페이지로 이동 
        failureRedirect: '/users/login', //고객이 입력한 로그인 정보가 데이터베이스 정보와 일치하지 않을 경우 
        failureFlash: true //플래쉬 메시지 사용 (예: 만약 로그인할 때 이메일이나 비번이 틀렸을 시 틀렸다는 메시지를 화면에 띄우기 위해서 사용)
    })(req, res, next);
})


// 로그아웃 핸들러 
router.get('/logout', (req, res) => {
    req.logout();  //passport 로그아웃 메소드  
    req.flash('success_msg', '정상적으로 로그아웃 되었습니다.');
    res.redirect('/users/login');
});







module.exports = router;


