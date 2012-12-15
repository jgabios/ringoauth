# namespace-skeleton
You should use this in a middleware, in a stick environment.
Example of how it can be used:

<code>

var ringoauth = require('ringoauth');

exports.middleware = function loginmiddleware(next, app) {

    return function(req) {
        // standard username/password login here and logout logic
        if(ringoauth.isRingoAuthRequest(req)){
            return ringoauth.ringoauth(req, persistUser);
        } else {
            return next(req);
        }
    }
}

</code>

And, of course, one has to fill in the details in the lib/config.js file for the logins supported.

