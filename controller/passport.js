"use strict";

//로그인할 때 유저가 입력한 이메일이 데이터베이스의 비밀번호와 일치하는지를 확인하기 위한 작업


const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
//해시를 해독하여 암호와 일치하는지를 확인하기 위해서 bcrypt를 불러온다.
const bcrypt = require('bcryptjs');


//데이터 베이스의 Schema model을 불러온다.
const User = require('../models/userStorage');

//app.js 파일에서 사용하기 위해 함수 내보내기를 한다.
module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            //Match User  로그인 정보와 데이터베이스 정보가 일치하는지 확인하는 절차
            User.findOne({ email: email })
                .then(user => {
                    if (!user) { //데이터베이스에 존재하는 정보가 없다면 
                        return done(null, false, { message: "존재하지 않는 주소입니다." });
                    }
                    //Match password 비밀번호 일치 확인 절차 (유저가 입력한 비번과 데이터베이스에 있는 비밀번호 일치하는지를 확인)
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err; //에러 일시 

                        if (isMatch) { //고객이 입력한 비번이 DB와 일치할시 
                            return done(null, user);
                        } else {
                            return done(null, false, { message: "잘못된 비밀번호입니다." });
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

}