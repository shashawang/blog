//检查登录状态
var config = require('../config');
var UserModel = require('../models/user');

function authUser(req, res, next) {
  res.locals.currentUser = null;

  if (req.session && req.session.user){
    const user = req.session.user;
    res.locals.currentUser = user;
    next();
  } else {
    const authToken = req.signedCookies[config.cookieName] || '';
  
  if (authToken) {
    UserModel.findOne({ _id: authToken }, function(err, user) {
      if (err || !user) {
        next(); // 为什么这里不是next(err)：因为要检查id不是要检查错误么
      } else {
        if (user.loginname === config.admin) {
          user.isAdmin = true;
        }

        res.session.user = user;
        res.locals.currentUser = user;
        next(); //为什么这里不是next(err)？？
      }
    });
  } else {
    next();
  }
}
}

function adminRequired(req, res, next) {
  if (!req.session || !req.session.user) {
    let err = new Error('需要登录');
    err.status = 403;
    next(err);
    return;
  }

  if (!req.session.user.isAdmin) {
    let err = new Error('需要管理员权限');
    err.status = 403;
    next(err);
    return;
  }

  next();
}
module.exports = { authUser, adminRequired };