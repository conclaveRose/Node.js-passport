// 인증 보장이라는 기능 -> 즉, 로그아웃을 했는데, 계속 dashboard에 접근이 가능한 것을 해결하기 위해서 모듈로 만든다.


module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', "접근권한이 없습니다. 로그인 하십시오");
        res.redirect('/users/login');
    }
}