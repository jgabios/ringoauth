
/**
 * @fileOverview 
 * the details can be obtained from these websites:
 * https://developers.facebook.com
 * https://dev.twitter.com/apps
 * https://code.google.com/apis/console
 *
 * redirectUri, or callbackUri, is the url where the authentication services call your url after the user granted
 * your app.
 * loginUri is the url of the login button the user will click in order to initiate the open authentication process.
 * TODO: to have a redirect url where the user will be redirected in case he rejected the app or there is an error in the service
 */

exports.oauthConfig = {
    google: {
        clientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com',
        clientSecret: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        oauthUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://accounts.google.com/o/oauth2/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v1/userinfo',
        redirectUri: '/googlecallback.js',
        loginUri: '/logingoogle.js',
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
    },
    twitter: {
        consumerKey: 'XXXXXXXXXXXXXXXXXXXXX',
        consumerSecret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        requestTokenURL: 'https://api.twitter.com/oauth/request_token',
        authorizeURL: 'https://api.twitter.com/oauth/authorize',
        accessTokenURL: 'https://api.twitter.com/oauth/access_token',
        redirectUri: '/twittercallback.js',
        loginUri: '/logintwitter.js'
    },
    facebook: {
        clientId: 'XXXXXXXXXXXXXXXXXXX',
        clientSecret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        oauthUrl: 'https://www.facebook.com/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/oauth/access_token',
        userInfoUrl: 'https://graph.facebook.com/me',
        redirectUri: '/facebookcallback.js',
        loginUri: '/loginfacebook.js'
    },
}


// your domain where your website resides
// it gets used as prefix for redirectUri keys above
exports.domain = 'mydomain.com';
