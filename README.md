You should use this in a middleware, in a Stick webapp on RingoJS.
Example of how it can be used:

```js
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
```
where persistUser is a function that takes 2 parameters, the request object and a user JSON object and persists the username/email
on the session or in a database. it is optional, a simple session persistance is in place.

And, of course, one has to fill in the details in the lib/config.js file for the logins supported.

