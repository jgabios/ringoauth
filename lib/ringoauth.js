/**
 * @fileOverview
 * this file provides ringoauth function that authenticates an user against 3 major oauth services:
 * facebook, google and twitter.
 */

var jsOauth = require('./jsOauth.js');
var {request} = require('ringo/httpclient');
var utilsHttp = require('ringo/utils/http');
var utilStrings = require('ringo/utils/strings');
var {oauthConfig, domain} = require('./config.js');

export('ringoauth', 'isRingoAuthRequest');

var getRandomKey = function(aproxLength){
    var rez = '';
    var randomStringLength = aproxLength + Math.ceil(10 * Math.random());
    for(var i = 0; i < randomStringLength; i++){
        rez += String.fromCharCode(65 + Math.ceil(10 * Math.random()));
        rez += '' + Math.ceil(10 * Math.random());
    }
    return rez;
};

var userSessionPersistence = function(req, userInfo){
    req.session.data['username'] = userInfo.email;
}

var getReturnResponse = function(req) {
    return {
            status: 302,
            headers: {
                "Location": req.session.data['returnUrl']
            },
            body: [""]
        };
}

var authRequest = {
    google: function(oauth, req, persistUser){
        var reqParams = req.params;
        if(req.pathInfo == oauth.redirectUri || req.pathInfo == '/zupazip' + oauth.redirectUri) {
            if(reqParams['code'] && reqParams['state'] == 'login') {
                var exchange = request({
                    url: oauth.tokenUrl,
                    method: 'POST',
                    data: {
                        code: reqParams['code'],
                        client_id: oauth.clientId,
                        client_secret: oauth.clientSecret,
                        redirect_uri: 'http://' + domain + oauth.redirectUri,
                        grant_type: 'authorization_code'
                    },
                    contentType: 'application/x-www-form-urlencoded'
                });
                var data = JSON.parse(exchange.content);
                exchange = request({
                    url: oauth.userInfoUrl,
                    data: {
                        access_token: data.access_token
                    },
                    method: 'GET'
                });
                persistUser(req, JSON.parse(exchange.content));
            }
            return getReturnResponse(req);
        }
        if(req.pathInfo == oauth.loginUri) {
                return {
                    status: 302,
                    headers: {
                        "Location": oauth.oauthUrl +
                            '?scope=' + encodeURIComponent(oauth.scope) +
                            '&client_id=' + encodeURIComponent(oauth.clientId) +
                            '&redirect_uri=' + encodeURIComponent('http://' + domain + oauth.redirectUri) +
                            '&state=' + 'login' +
                            '&response_type=' + 'code'
                    },
                    body: [""]
                };
        }
      },
    twitter: function(oauth, req, persistUser){
        var reqParams = req.params;
        if(req.pathInfo == oauth.loginUri) {
                var twitterOauth = jsOauth.OAuth({
                    consumerKey: oauth.consumerKey,
                    consumerSecret: oauth.consumerSecret
                });
                twitterOauth.post(oauth.requestTokenURL + '?oauth_callback=' + encodeURIComponent('http://' + domain + oauth.redirectUri), {oauth_callback: 'http://' + domain + oauth.redirectUri}, function(data){
                    var params = utilsHttp.parseParameters(data.text);
                    req.session.data['oauth_token'] = params['oauth_token'];
                    req.session.data['oauth_token_secret'] = params['oauth_token_secret'];
                    req.session.data['verified'] = false;
                    twitterOauth.setAccessToken(params['oauth_token'], params['oauth_token_secret']);
                }, null, true);
                return {
                    status: 302,
                    headers: {
                        "Location": oauth.authorizeURL + "?oauth_token=" + twitterOauth.getAccessTokenKey()
                    },
                    body: [""]
                };
        }
        if(req.pathInfo == oauth.redirectUri || req.pathInfo == '/zupazip' + oauth.redirectUri) {
            if(req.session.data['oauth_token']){
                req.session.data['verified'] = true;
                var twitterOauth = jsOauth.OAuth({
                    consumerKey: oauth.consumerKey,
                    consumerSecret: oauth.consumerSecret,
                    accessTokenKey: reqParams['oauth_token'],
                    accessTokenSecret: req.session.data['oauth_token_secret']
                });
                twitterOauth.post(oauth.accessTokenURL + '?oauth_verifier=' + encodeURIComponent(reqParams['oauth_verifier']), {oauth_verifier: reqParams['oauth_verifier']}, function(data){
                    var params = utilsHttp.parseParameters(data.text);
                    req.session.data['oauth_token'] = params['oauth_token'];
                    req.session.data['oauth_token_secret'] = params['oauth_token_secret'];
                    params['email'] = params['screen_name'] + '@twitter.com';
                    persistUser(req, params);
                }, null, true);
            }
            return getReturnResponse(req);
        }
 
    },
    facebook: function(oauth, req, persistUser){
        var reqParams = req.params;
        if(req.pathInfo == oauth.loginUri) {
                var facebookState = utilStrings.digest(getRandomKey(11));
                req.session.data['facebookState'] = facebookState;
                return {
                    status: 302,
                    headers: {
                        "Location": oauth.oauthUrl +
                            '?client_id=' + encodeURIComponent(oauth.clientId) +
                            '&redirect_uri=' + encodeURIComponent('http://' + domain + oauth.redirectUri) +
                            '&state=' + facebookState
                    },
                    body: [""]
                };
        }
        if(req.pathInfo == oauth.redirectUri || req.pathInfo == '/zupazip' + oauth.redirectUri) {
            if(reqParams['code'] && reqParams['state'] == req.session.data['facebookState']) {
                var exchange = request({
                    url: oauth.tokenUrl + '?code=' + reqParams['code']
                                        + '&client_id=' + oauth.clientId
                                        + '&client_secret=' + oauth.clientSecret
                                        + '&redirect_uri=' + encodeURIComponent('http://' + domain + oauth.redirectUri),
                    method: 'GET'
                });
                var params = utilsHttp.parseParameters(exchange.content);
                exchange = request({
                    url: oauth.userInfoUrl + '?access_token=' + params['access_token'],
                    method: 'GET'
                });
                var userInfo = JSON.parse(exchange.content);
                userInfo['email']  = userInfo.username+'@facebook.com';
                persistUser(req, userInfo);
            }
            return getReturnResponse(req);
        }
    }
}

/**
 * Determines if the request is the one used in oauth or not
 * it checks the redirectUri and loginUri keys in the config files.
 * 
 * @param {Request} req The request object
 * @returns {Boolean} whether this request is used for oauth authentication or not
 * 
 */
function isRingoAuthRequest(req){
    var isOauthRequest = false;
    for(var auth in oauthConfig) {
        if([oauthConfig[auth].loginUri, oauthConfig[auth].redirectUri].indexOf(req.pathInfo) != -1){
          isOauthRequest = true;
          req.session.data['oauthType'] = auth;
          if(req.pathInfo == oauthConfig[auth].loginUri) {
              req.session.data['returnUrl'] = req.headers.referer || '/';
          }
          break;
        }
    }
    return isOauthRequest;
}

/**
 * @param {Request} req The request object
 * @param {Function} [persistUser] A function that takes the request and a userinfo JSON object and persists that info to session or database
 * @returns {Object} Returns a json, it is a Stick response with status, headers and body
 * 
 */
function ringoauth(req, persistUser) {
        return authRequest[req.session.data['oauthType']](oauthConfig[req.session.data['oauthType']], req, persistUser || userSessionPersistence);
}
