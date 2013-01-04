var ringoauth = require('ringoauth');

exports.middleware = function loginmiddleware(next, app) {

    return function(req) {
        // standard username/password login here and logout logic
        if(ringoauth.isRingoAuthRequest(req)){
            return ringoauth.ringoauth(req);
        } else {
            return next(req);
        }
    }
}

