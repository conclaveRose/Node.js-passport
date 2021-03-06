"use strict";

//로그인할 때 유저가 입력한 이메일이 데이터베이스의 비밀번호와 일치하는지를 확인하기 위한 작업

//전통적인 아이디와 비번을 이용해서 로그인 하는 방식의 전략을 선택한다.
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
//해시를 해독하여 암호와 일치하는지를 확인하기 위해서 bcrypt를 불러온다.
const bcrypt = require('bcryptjs');


//데이터 베이스의 Schema model을 불러온다.
const User = require('../models/userStorage');

//app.js 파일에서 사용하기 위해 함수 내보내기를 한다. (로그인에 성공했는지 실패했는지를 판별하는 코드 )
module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => { //첫번째 인자로 들어간 객체의 usernameField는 유저의 기본 이름을 email로 사용하겠다는 것이다. 그리고 두번째 콜백함수 인자로 form 으로 전달받은 정보인 email과 password가 들어간다. 
            //usernameField와 passwordField의 기본값은 'username' 과 'password'이다 

            //Match User  로그인 정보와 데이터베이스 정보가 일치하는지 확인하는 절차
            User.findOne({ email: email })
                .then(user => {
                    if (!user) { //데이터베이스에 존재하는 정보가 없다면 
                        return done(null, false, { message: "존재하지 않는 주소입니다." }); //플래시 메시지를 보낸다.
                    }
                    //Match password 비밀번호 일치 확인 절차 (유저가 입력한 비번과 데이터베이스에 있는 비밀번호 일치하는지를 확인)
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err; //에러 일시 

                        if (isMatch) { //고객이 입력한 비번이 DB와 일치할시 
                            return done(null, user); //패스포트에게 현재 접속한 유저가 누구인지를 user정보를 전달해 알려준다. 
                        } else {
                            return done(null, false, { message: "잘못된 비밀번호입니다." });
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );


    // 성공적인 로그인 후 유저의 여권을 Session에 저장하기 위한 절차 (즉, 고객이 로그인에 성공했을 때 고객이 로그인에 성공했다는 증표로서 식별자(id))를 session store에 저장을 하게 된다. 
    passport.serializeUser((user, done) => { //패스포트는 로그인에 성공했다면 user의 정보가 첫번째 인자로 전달된다.
        done(null, user.id); //done의 두번째 인자로는 각각의 사용자를 식별할 수 있는 id를 전달한다. 
    });                 //즉, 로그인에 성공하면 유저를 식별할 수 있는 패스포트(여권이 발행되는 것이다.)


    // 고객에 로그인에 성공하고나서 각각의 페이지를 방문할 때는 로그인에 성공한 유저인지 확인하기 위해서 deserializeUser가 호출되고 로그인한 유저라는 것을 확인한다. 
    passport.deserializeUser((id, done) => {    // 로그인이 되었으면 페이지에 방문할 때 마다 deseriallizeUser의 콜백이 호출되도록 약속되어져 있다. 따라서 유저의 식별자를 통해(여권)서 실제 데이터가 저장되어져 있는 DB에서 사용자의 실제 데이터를 조회해서 가져오는 역할을 수행한다.

        //설명 : 첫번째 인자로는 유저의 아이디 값이 들어간다. 이 값을 통해서 실제 데이터베이스에 있는 유저의 아이디값이 일치하는지 조회(findBYId)를 해보고 
        //일치한다면 done의 두번째 인자로 해서 유저의 정보가 전달되어져 처리된다.
        //예) 사이트에 로그인을 한 후 페이지를 이동할 때도 로그인 상태가 유지되는 것처럼.
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

}

//정리 : 로그인을 처음 했을때는 serializeUser가 호출되는데, 이는  고객이 로그인에 성공했다는 증표(여권)같은 개념으로서 유저의 식별자를 session store에 한번 저장하는 역할을 수행한다.  그리고 로그인이 유지되어 있는 상태에서는 더이상 호출되지 않는다. 

//유저가 로그인에 성공한 후에 각 각의 페이지를 방문하게 되는데, 그 때마다 deserializeUser가 호출된다. 이는 고객이 로그인에 성공했을 때 serializeUser호출에 의해 고객의 식별자(id)즉, 여권같은 것이 세션스토어에 저장되어 지는데, 유저가 페이지에 방물할 때마다 로그인을 한 유저인지를  조회하는 절차를 수행하는 것이 deserializeUser의 역할이다. 
